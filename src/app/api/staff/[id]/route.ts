import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/staff/[id] - Get staff detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { id } = await params;

    const staff = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        phone: true,
        avatarUrl: true,
        hospitalId: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            assignments: true,
            enrollments: true,
          },
        },
      },
    });

    if (!staff) {
      return NextResponse.json(
        { error: "Personel bulunamadı" },
        { status: 404 }
      );
    }

    // ADMIN sadece kendi hastanesindeki personeli görebilir
    if (
      session.user.role === "ADMIN" &&
      staff.hospitalId !== session.user.hospitalId
    ) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    return NextResponse.json(staff);
  } catch (error) {
    console.error("Error fetching staff:", error);
    return NextResponse.json(
      { error: "Personel bilgisi yüklenemedi" },
      { status: 500 }
    );
  }
}

// PUT /api/staff/[id] - Update staff
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Check if staff exists and belongs to hospital
    const existingStaff = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingStaff) {
      return NextResponse.json(
        { error: "Personel bulunamadı" },
        { status: 404 }
      );
    }

    if (existingStaff.hospitalId !== session.user.hospitalId) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    // Update staff
    const { name, email, department, phone, isActive } = body;
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (department !== undefined) updateData.department = department;
    if (phone !== undefined) updateData.phone = phone;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedStaff = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        phone: true,
        avatarUrl: true,
        isActive: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        hospitalId: session.user.hospitalId!,
        action: "UPDATE_STAFF",
        entityType: "User",
        entityId: id,
        changes: {
          before: existingStaff,
          after: updatedStaff,
        },
      },
    });

    return NextResponse.json(updatedStaff);
  } catch (error) {
    console.error("Error updating staff:", error);
    return NextResponse.json(
      { error: "Personel güncellenemedi" },
      { status: 500 }
    );
  }
}

// DELETE /api/staff/[id] - Soft delete staff
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { id } = await params;

    const staff = await prisma.user.findUnique({
      where: { id },
    });

    if (!staff) {
      return NextResponse.json(
        { error: "Personel bulunamadı" },
        { status: 404 }
      );
    }

    if (staff.hospitalId !== session.user.hospitalId) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    // Soft delete (set isActive = false)
    await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        hospitalId: session.user.hospitalId!,
        action: "DELETE_STAFF",
        entityType: "User",
        entityId: id,
        changes: {
          before: staff,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting staff:", error);
    return NextResponse.json(
      { error: "Personel silinemedi" },
      { status: 500 }
    );
  }
}
