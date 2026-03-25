import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma as db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    // Get all hospital subscriptions with related data
    const subscriptions = await db.hospitalSubscription.findMany({
      include: {
        hospital: true,
        plan: true,
      },
      orderBy: {
        endDate: "asc",
      },
    });

    // Calculate days remaining and update status if needed
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const formattedSubscriptions = subscriptions.map((sub) => {
      const daysRemaining = Math.ceil(
        (sub.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Determine status
      let status = sub.status;
      if (sub.endDate < now && sub.status !== "EXPIRED") {
        status = "EXPIRED";
      } else if (
        sub.endDate <= thirtyDaysFromNow &&
        sub.status === "ACTIVE"
      ) {
        status = "EXPIRING";
      }

      return {
        id: sub.id,
        hospitalId: sub.hospital.id,
        hospitalName: sub.hospital.name,
        hospitalCode: sub.hospital.code,
        hospitalCity: sub.hospital.city,
        planName: sub.plan.name,
        planPrice: sub.plan.price,
        status,
        startDate: sub.startDate,
        endDate: sub.endDate,
        trialEndDate: sub.trialEndDate,
        lastPaymentDate: sub.lastPaymentDate,
        daysRemaining,
      };
    });

    return NextResponse.json(formattedSubscriptions);
  } catch (error) {
    console.error("Subscriptions GET error:", error);
    return NextResponse.json(
      { error: "Abonelikler yüklenemedi" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const body = await req.json();
    const { subscriptionId, status, endDate, planId } = body;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Abonelik ID gerekli" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (endDate) updateData.endDate = new Date(endDate);
    if (planId) updateData.planId = planId;

    const updated = await db.hospitalSubscription.update({
      where: { id: subscriptionId },
      data: updateData,
      include: {
        hospital: true,
        plan: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Subscription PUT error:", error);
    return NextResponse.json(
      { error: "Abonelik güncellenemedi" },
      { status: 500 }
    );
  }
}
