import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendTrainingAssignmentEmail } from "@/lib/email";

// POST /api/trainings/[id]/assign - Personel ata
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { id: trainingId } = await params;
    const body = await request.json();
    const { userIds } = body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "Personel seçmelisiniz" },
        { status: 400 }
      );
    }

    // Training kontrolü
    const training = await prisma.training.findUnique({
      where: { id: trainingId },
    });

    if (!training) {
      return NextResponse.json(
        { error: "Eğitim bulunamadı" },
        { status: 404 }
      );
    }

    if (training.hospitalId !== session.user.hospitalId) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    // Kullanıcıların aynı hastanede olduğunu kontrol et
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
        hospitalId: session.user.hospitalId,
        role: "STAFF",
        isActive: true,
      },
    });

    if (users.length !== userIds.length) {
      return NextResponse.json(
        { error: "Geçersiz personel seçimi" },
        { status: 400 }
      );
    }

    // Mevcut atamaları kontrol et
    const existingAssignments = await prisma.trainingAssignment.findMany({
      where: {
        trainingId,
        userId: { in: userIds },
      },
    });

    const existingUserIds = existingAssignments.map((a) => a.userId);
    const newUserIds = userIds.filter((id) => !existingUserIds.includes(id));

    if (newUserIds.length === 0) {
      return NextResponse.json(
        { error: "Seçilen tüm personeller zaten atanmış" },
        { status: 400 }
      );
    }

    // Yeni atamaları oluştur
    await prisma.trainingAssignment.createMany({
      data: newUserIds.map((userId) => ({
        trainingId,
        userId,
        maxAttempts: training.maxAttempts,
        assignedBy: session.user.id,
      })),
    });

    // Bildirimler oluştur (opsiyonel)
    await prisma.notification.createMany({
      data: newUserIds.map((userId) => ({
        receiverId: userId,
        hospitalId: session.user.hospitalId!,
        title: "Yeni Eğitim Ataması",
        message: `"${training.title}" eğitimi size atandı. Bitiş tarihi: ${training.endDate.toLocaleDateString("tr-TR")}`,
        type: "INFO",
        link: `/staff/my-trainings/${trainingId}`,
      })),
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        hospitalId: session.user.hospitalId!,
        action: "ASSIGN_TRAINING",
        entityType: "Training",
        entityId: trainingId,
        changes: {
          userIds: newUserIds,
          count: newUserIds.length,
        },
      },
    });

    // Send email notifications to assigned users
    const newUsers = users.filter((u) => newUserIds.includes(u.id));
    const loginUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/staff/my-trainings/${trainingId}`;

    newUsers.forEach((user) => {
      sendTrainingAssignmentEmail({
        recipientEmail: user.email,
        recipientName: user.name,
        trainingTitle: training.title,
        trainingDescription: training.description,
        dueDate: training.endDate,
        loginUrl,
      }).catch((error) => {
        console.error(`Failed to send assignment email to ${user.email}:`, error);
        // Email hatası atama işlemini etkilemez
      });
    });

    return NextResponse.json({
      success: true,
      assignedCount: newUserIds.length,
      skippedCount: existingUserIds.length,
    });
  } catch (error) {
    console.error("Error assigning training:", error);
    return NextResponse.json(
      { error: "Personel atanırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// GET /api/trainings/[id]/assign - Atanan personelleri listele
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { id: trainingId } = await params;

    const assignments = await prisma.trainingAssignment.findMany({
      where: { trainingId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { assignedAt: "desc" },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Atamalar yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
