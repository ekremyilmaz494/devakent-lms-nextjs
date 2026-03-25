import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendTrainingAssignmentEmail } from "@/lib/email";
import { z } from "zod";

const bulkAssignSchema = z.object({
  assignType: z.enum(["all", "department"]),
  department: z.string().optional(),
});

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
    const { assignType, department } = bulkAssignSchema.parse(body);

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

    // Filtreleme kriterlerini belirle
    const where: any = {
      hospitalId: session.user.hospitalId!,
      role: "STAFF",
      isActive: true,
    };

    if (assignType === "department" && department) {
      where.department = department;
    }

    // İlgili personelleri getir
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
      },
    });

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Atanacak personel bulunamadı" },
        { status: 400 }
      );
    }

    const userIds = users.map((u) => u.id);

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
        {
          success: true,
          message: "Tüm personeller zaten atanmış",
          assignedCount: 0,
          skippedCount: existingUserIds.length,
        },
        { status: 200 }
      );
    }

    // Toplu atama oluştur
    await prisma.trainingAssignment.createMany({
      data: newUserIds.map((userId) => ({
        trainingId,
        userId,
        maxAttempts: training.maxAttempts,
        assignedBy: session.user.id,
      })),
    });

    // Bildirimler oluştur
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
        action: "BULK_ASSIGN_TRAINING",
        entityType: "Training",
        entityId: trainingId,
        changes: {
          assignType,
          department: department || "all",
          assignedCount: newUserIds.length,
          skippedCount: existingUserIds.length,
        },
      },
    });

    // Email bildirimleri gönder
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
      });
    });

    return NextResponse.json({
      success: true,
      message: `${newUserIds.length} personele eğitim atandı`,
      assignedCount: newUserIds.length,
      skippedCount: existingUserIds.length,
      totalUsers: users.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz istek verisi", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error bulk assigning training:", error);
    return NextResponse.json(
      { error: "Toplu atama sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
}
