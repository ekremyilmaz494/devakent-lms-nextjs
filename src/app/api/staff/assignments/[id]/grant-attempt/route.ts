import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST /api/staff/assignments/[id]/grant-attempt - Grant new attempt to locked assignment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { id: assignmentId } = await params;

    // Get assignment
    const assignment = await prisma.trainingAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            hospitalId: true,
          },
        },
        training: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Atama bulunamadı" },
        { status: 404 }
      );
    }

    // Check hospital access for ADMIN
    if (
      session.user.role === "ADMIN" &&
      assignment.user.hospitalId !== session.user.hospitalId
    ) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    // Check if locked
    if (assignment.status !== "locked") {
      return NextResponse.json(
        { error: "Sadece kilitli eğitimler için deneme hakkı verilebilir" },
        { status: 400 }
      );
    }

    // Grant new attempt - increase maxAttempts and change status to failed
    const updatedAssignment = await prisma.trainingAssignment.update({
      where: { id: assignmentId },
      data: {
        maxAttempts: assignment.maxAttempts + 1,
        status: "failed", // Change from locked to failed so user can retry
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        training: {
          select: {
            title: true,
          },
        },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        hospitalId: session.user.hospitalId!,
        action: "GRANT_ATTEMPT",
        entityType: "TrainingAssignment",
        entityId: assignmentId,
        changes: {
          before: {
            maxAttempts: assignment.maxAttempts,
            status: assignment.status,
          },
          after: {
            maxAttempts: updatedAssignment.maxAttempts,
            status: updatedAssignment.status,
          },
          staffName: assignment.user.name,
          trainingTitle: assignment.training.title,
        },
      },
    });

    return NextResponse.json({
      success: true,
      assignment: {
        id: updatedAssignment.id,
        maxAttempts: updatedAssignment.maxAttempts,
        currentAttempt: updatedAssignment.currentAttempt,
        status: updatedAssignment.status,
      },
      message: `${updatedAssignment.user.name} için "${updatedAssignment.training.title}" eğitiminde yeni deneme hakkı verildi`,
    });
  } catch (error) {
    console.error("Error granting attempt:", error);
    return NextResponse.json(
      { error: "Deneme hakkı verilemedi" },
      { status: 500 }
    );
  }
}
