import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma as db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const plan = searchParams.get("plan") || "all";

    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
      ];
    }

    // Status filter
    if (status !== "all") {
      where.isActive = status === "active";
    }

    const hospitals = await db.hospital.findMany({
      where,
      include: {
        subscription: {
          include: { plan: true },
        },
        _count: {
          select: {
            users: { where: { role: "STAFF" } },
            trainings: { where: { deletedAt: null } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Plan filter (client-side olarak yapılabilir ama burada da yapabiliriz)
    let filteredHospitals = hospitals;
    if (plan !== "all") {
      filteredHospitals = hospitals.filter((h) => h.subscription?.plan.name === plan);
    }

    const result = filteredHospitals.map((h) => ({
      id: h.id,
      name: h.name,
      code: h.code,
      city: h.city,
      address: h.address,
      phone: h.phone,
      logo: h.logo,
      isActive: h.isActive,
      createdAt: h.createdAt,
      staffCount: h._count.users,
      trainingCount: h._count.trainings,
      plan: h.subscription?.plan || null,
      subscription: h.subscription
        ? {
            id: h.subscription.id,
            status: h.subscription.status,
            startDate: h.subscription.startDate,
            endDate: h.subscription.endDate,
          }
        : null,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Hospitals GET error:", error);
    return NextResponse.json({ error: "Hastaneler yüklenemedi" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      code,
      city,
      address,
      phone,
      logo,
      adminName,
      adminEmail,
      adminPassword,
      planId,
      subscriptionEndDate,
    } = body;

    // Validation
    if (!name || !code || !city || !adminName || !adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: "Gerekli alanlar eksik" },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existingHospital = await db.hospital.findUnique({
      where: { code },
    });

    if (existingHospital) {
      return NextResponse.json(
        { error: "Bu hastane kodu zaten kullanılıyor" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Bu e-posta adresi zaten kullanılıyor" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create hospital with admin and subscription in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create hospital
      const hospital = await tx.hospital.create({
        data: {
          name,
          code,
          city,
          address,
          phone,
          logo,
        },
      });

      // Create admin user
      await tx.user.create({
        data: {
          name: adminName,
          email: adminEmail,
          password: hashedPassword,
          role: "ADMIN",
          hospitalId: hospital.id,
        },
      });

      // Create subscription if planId provided
      if (planId) {
        const endDate = subscriptionEndDate
          ? new Date(subscriptionEndDate)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days default

        await tx.hospitalSubscription.create({
          data: {
            hospitalId: hospital.id,
            planId,
            status: "TRIAL",
            endDate,
            trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
          },
        });
      }

      return hospital;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Hospital POST error:", error);
    return NextResponse.json({ error: "Hastane oluşturulamadı" }, { status: 500 });
  }
}
