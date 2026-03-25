import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma as db } from "@/lib/db";

// GET - List certificates (admin only)
export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const hospitalId = session.user.hospitalId;

    // Build where clause
    const where: any = {};

    // Hospital isolation (admin only sees their hospital)
    if (!isSuperAdmin && hospitalId) {
      where.user = {
        hospitalId,
      };
    }

    // Status filter
    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }

    const certificates = await db.certificate.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            hospital: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get training titles
    const certificatesWithTraining = await Promise.all(
      certificates.map(async (cert) => {
        const training = await db.training.findUnique({
          where: { id: cert.trainingId },
          select: { title: true, category: true },
        });

        return {
          id: cert.id,
          certificateNo: cert.certificateNo,
          status: cert.status,
          createdAt: cert.createdAt,
          approvedAt: cert.approvedAt,
          approvedBy: cert.approvedBy,
          rejectedReason: cert.rejectedReason,
          pdfUrl: cert.pdfUrl,
          user: {
            id: cert.user.id,
            name: cert.user.name,
            email: cert.user.email,
            department: cert.user.department,
            hospital: cert.user.hospital?.name,
          },
          training: {
            id: cert.trainingId,
            title: training?.title || "Bilinmiyor",
            category: training?.category,
          },
        };
      })
    );

    return NextResponse.json({
      certificates: certificatesWithTraining,
    });
  } catch (error) {
    console.error("Error fetching certificates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
