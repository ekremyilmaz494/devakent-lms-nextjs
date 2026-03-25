import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma as db } from "@/lib/db";

// GET - Admin gönderilen bildirimleri listele
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const skip = (page - 1) * limit;

    // Get sent notifications (grouped by unique title+message+createdAt)
    const sentNotifications = await db.notification.findMany({
      where: {
        hospitalId: session.user.hospitalId,
        senderId: { not: null }, // Sistem bildirimleri hariç
      },
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        createdAt: true,
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    // Group by title, message, and createdAt to show unique broadcasts
    const groupedNotifications = new Map();

    for (const notif of sentNotifications) {
      const key = `${notif.title}-${notif.message}-${new Date(notif.createdAt).toISOString()}`;

      if (!groupedNotifications.has(key)) {
        // Count recipients for this notification
        const recipientCount = await db.notification.count({
          where: {
            title: notif.title,
            message: notif.message,
            createdAt: notif.createdAt,
            hospitalId: session.user.hospitalId,
          },
        });

        // Count read
        const readCount = await db.notification.count({
          where: {
            title: notif.title,
            message: notif.message,
            createdAt: notif.createdAt,
            hospitalId: session.user.hospitalId,
            isRead: true,
          },
        });

        groupedNotifications.set(key, {
          ...notif,
          recipientCount,
          readCount,
        });
      }
    }

    const notifications = Array.from(groupedNotifications.values());

    const totalCount = groupedNotifications.size;

    return NextResponse.json({
      notifications,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Sent notifications fetch error:", error);
    return NextResponse.json(
      { error: "Gönderilen bildirimler yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
