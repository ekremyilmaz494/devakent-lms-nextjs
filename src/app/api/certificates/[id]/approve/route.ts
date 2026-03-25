import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma as db } from "@/lib/db";
import { sendCertificateApprovedEmail } from "@/lib/email";

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

    // Get certificate
    const certificate = await db.certificate.findUnique({
      where: { id: certificateId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
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

    // Check if already approved
    if (certificate.status === "APPROVED") {
      return NextResponse.json(
        { error: "Certificate already approved" },
        { status: 400 }
      );
    }

    // Approve certificate
    const updated = await db.certificate.update({
      where: { id: certificateId },
      data: {
        status: "APPROVED",
        approvedBy: session.user.id,
        approvedAt: new Date(),
        rejectedReason: null,
      },
    });

    // Get training info
    const training = await db.training.findUnique({
      where: { id: certificate.trainingId },
      select: { title: true },
    });

    // TODO: Generate PDF certificate here
    // const pdfUrl = await generateCertificatePDF({ ... });
    // await db.certificate.update({ where: { id: certificateId }, data: { pdfUrl } });

    // Send email notification
    if (training) {
      sendCertificateApprovedEmail({
        recipientEmail: certificate.user.email,
        recipientName: certificate.user.name,
        trainingTitle: training.title,
        certificateNo: certificate.certificateNo,
        certificateUrl: updated.pdfUrl || "#", // Will be real URL after PDF generation
      }).catch((error) => {
        console.error("Failed to send certificate approved email:", error);
      });
    }

    return NextResponse.json({
      success: true,
      certificate: updated,
    });
  } catch (error) {
    console.error("Error approving certificate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
