import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma as db } from "@/lib/db";

// POST - Admin bildirim gönder
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const body = await request.json();
    const { title, message, type, receiverIds, sendToAll, link } = body;

    if (!title || !message || !type) {
      return NextResponse.json(
        { error: "Başlık, mesaj ve tip gereklidir" },
        { status: 400 }
      );
    }

    let targetUserIds: string[] = [];

    if (sendToAll) {
      // Tüm personellere gönder
      const allStaff = await db.user.findMany({
        where: {
          role: "STAFF",
          hospitalId: session.user.hospitalId,
          isActive: true,
        },
        select: { id: true },
      });
      targetUserIds = allStaff.map((u) => u.id);
    } else if (receiverIds && Array.isArray(receiverIds) && receiverIds.length > 0) {
      targetUserIds = receiverIds;
    } else {
      return NextResponse.json(
        { error: "Alıcı seçilmedi" },
        { status: 400 }
      );
    }

    // Create notifications for all target users
    const notifications = await db.notification.createMany({
      data: targetUserIds.map((userId) => ({
        title,
        message,
        type,
        senderId: session.user.id,
        receiverId: userId,
        hospitalId: session.user.hospitalId!,
        link: link || null,
      })),
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        hospitalId: session.user.hospitalId!,
        action: "SEND_NOTIFICATION",
        entityType: "Notification",
        entityId: "bulk", // Bulk notification has no specific entity ID
        changes: {
          title,
          message,
          type,
          recipientCount: targetUserIds.length,
          sendToAll,
        },
      },
    });

    return NextResponse.json({
      success: true,
      count: notifications.count,
      message: `${notifications.count} kişiye bildirim gönderildi`,
    });
  } catch (error) {
    console.error("Notification send error:", error);
    return NextResponse.json(
      { error: "Bildirim gönderilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
