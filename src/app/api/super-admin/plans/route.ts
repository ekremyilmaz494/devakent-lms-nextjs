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

    const plans = await db.subscriptionPlan.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
      orderBy: { price: "asc" },
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error("Plans GET error:", error);
    return NextResponse.json({ error: "Planlar yüklenemedi" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, price, maxUsers, maxTrainings, features } = body;

    if (!name || price === undefined || !maxUsers || !maxTrainings) {
      return NextResponse.json({ error: "Gerekli alanlar eksik" }, { status: 400 });
    }

    const plan = await db.subscriptionPlan.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        maxUsers: parseInt(maxUsers),
        maxTrainings: parseInt(maxTrainings),
        features: features || [],
      },
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    console.error("Plan POST error:", error);
    return NextResponse.json({ error: "Plan oluşturulamadı" }, { status: 500 });
  }
}
