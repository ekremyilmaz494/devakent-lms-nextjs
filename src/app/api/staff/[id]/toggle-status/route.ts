import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// PATCH /api/staff/[id]/toggle-status - Toggle staff active status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { id: staffId } = await params;

    // Get current staff
    const staff = await prisma.user.findUnique({
      where: {
        id: staffId,
        role: "STAFF",
      },
      select: {
        id: true,
        isActive: true,
        name: true,
        hospitalId: true,
      },
    });

    if (!staff) {
      return NextResponse.json(
        { error: "Personel bulunamadı" },
        { status: 404 }
      );
    }

    // Check hospital access for ADMIN
    if (
      session.user.role === "ADMIN" &&
      staff.hospitalId !== session.user.hospitalId
    ) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    // Toggle status
    const updatedStaff = await prisma.user.update({
      where: { id: staffId },
      data: {
        isActive: !staff.isActive,
      },
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        hospitalId: session.user.hospitalId!,
        action: updatedStaff.isActive ? "ACTIVATE_STAFF" : "DEACTIVATE_STAFF",
        entityType: "User",
        entityId: staffId,
        changes: {
          before: { isActive: staff.isActive },
          after: { isActive: updatedStaff.isActive },
        },
      },
    });

    return NextResponse.json({
      success: true,
      staff: updatedStaff,
    });
  } catch (error) {
    console.error("Error toggling staff status:", error);
    return NextResponse.json(
      { error: "Durum değiştirilemedi" },
      { status: 500 }
    );
  }
}
