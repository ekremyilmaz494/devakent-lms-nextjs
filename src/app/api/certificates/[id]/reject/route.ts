import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma as db } from "@/lib/db";
import { z } from "zod";

const rejectSchema = z.object({
  reason: z.string().min(10, "Rejection reason must be at least 10 characters"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = session.user.role === "ADMIN";
    const isSuperAdmin = session.user.role === "SUPER_ADMIN";

    if (!isAdmin && !isSuperAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: certificateId } = await params;
    const body = await req.json();
    const { reason } = rejectSchema.parse(body);

    // Get certificate
    const certificate = await db.certificate.findUnique({
      where: { id: certificateId },
      include: {
        user: {
          select: {
            hospitalId: true,
          },
        },
      },
    });

    if (!certificate) {
      return NextResponse.json(
        { error: "Certificate not found" },
        { status: 404 }
      );
    }

    // Hospital isolation check
    if (!isSuperAdmin && certificate.user.hospitalId !== session.user.hospitalId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Reject certificate
    const updated = await db.certificate.update({
      where: { id: certificateId },
      data: {
        status: "REJECTED",
        rejectedReason: reason,
        approvedBy: null,
        approvedAt: null,
      },
    });

    // TODO: Send email notification about rejection

    return NextResponse.json({
      success: true,
      certificate: updated,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error rejecting certificate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
