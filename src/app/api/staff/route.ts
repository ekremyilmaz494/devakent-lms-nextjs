import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/staff - List staff members
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const department = searchParams.get("department");
    const hospitalId = session.user.role === "ADMIN" ? session.user.hospitalId : searchParams.get("hospitalId");

    // Build where clause
    const where: any = {
      role: "STAFF",
    };

    if (hospitalId) {
      where.hospitalId = hospitalId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { tcNo: { contains: search, mode: "insensitive" } },
      ];
    }

    if (department && department !== "all") {
      where.department = department;
    }

    const staff = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        tcNo: true,
        department: true,
        title: true,
        phone: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            assignments: true,
          },
        },
        assignments: {
          where: {
            status: "passed",
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Calculate success rate and format response
    const formattedStaff = staff.map((member) => {
      const completedTrainings = member.assignments.length;
      const totalAssignments = member._count.assignments;
      const successRate = totalAssignments > 0 ? (completedTrainings / totalAssignments) * 100 : 0;

      return {
        id: member.id,
        name: member.name,
        email: member.email,
        tcNo: member.tcNo,
        department: member.department,
        title: member.title,
        phone: member.phone,
        avatarUrl: member.avatarUrl,
        isActive: member.isActive,
        createdAt: member.createdAt.toISOString(),
        lastLoginAt: member.lastLoginAt?.toISOString() || null,
        _count: {
          assignments: totalAssignments,
        },
        completedTrainings,
        successRate,
      };
    });

    return NextResponse.json({ staff: formattedStaff });
  } catch (error) {
    console.error("Error fetching staff:", error);
    return NextResponse.json(
      { error: "Personel listesi yüklenemedi" },
      { status: 500 }
    );
  }
}

// POST /api/staff - Create staff member
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, tcNo, password, department, title, phone } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "İsim, email ve şifre gereklidir" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: "Bu email zaten kullanılıyor" },
        { status: 400 }
      );
    }

    // Check if TC No already exists (if provided)
    if (tcNo) {
      const existingTc = await prisma.user.findUnique({
        where: { tcNo },
      });

      if (existingTc) {
        return NextResponse.json(
          { error: "Bu TC Kimlik No zaten kullanılıyor" },
          { status: 400 }
        );
      }
    }

    // Hash password
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create staff member
    const staff = await prisma.user.create({
      data: {
        name,
        email,
        tcNo: tcNo || null,
        password: hashedPassword,
        role: "STAFF",
        department: department || null,
        title: title || null,
        phone: phone || null,
        hospitalId: session.user.hospitalId!,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        tcNo: true,
        department: true,
        title: true,
        phone: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        hospitalId: session.user.hospitalId!,
        action: "CREATE_STAFF",
        entityType: "User",
        entityId: staff.id,
        changes: {
          after: {
            name: staff.name,
            email: staff.email,
            tcNo: staff.tcNo,
            department: staff.department,
            title: staff.title
          },
        },
      },
    });

    return NextResponse.json(staff, { status: 201 });
  } catch (error) {
    console.error("Error creating staff:", error);
    return NextResponse.json(
      { error: "Personel oluşturulamadı" },
      { status: 500 }
    );
  }
}
