"use client";

import { useEffect, useState } from "react";
import { Bell, Check, CheckCheck, Mail, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    name: string;
    avatarUrl?: string;
  };
}

const notificationIcons: Record<string, any> = {
  ASSIGNMENT: Mail,
  REMINDER: Bell,
  ALERT: AlertCircle,
  INFO: Info,
};

const notificationColors: Record<string, string> = {
  ASSIGNMENT: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  REMINDER: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  ALERT: "bg-red-500/10 text-red-700 dark:text-red-400",
  INFO: "bg-green-500/10 text-green-700 dark:text-green-400",
};

export default function StaffNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Notifications fetch error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function markAllAsRead() {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Mark all as read error:", error);
    }
  }

  async function markAsRead(notificationId: string) {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: [notificationId] }),
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Mark as read error:", error);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Bildirimler</h1>
          <p className="text-sm text-muted-foreground">
            Eğitim atamaları ve hatırlatmalar.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline" size="sm">
            <CheckCheck className="mr-2 h-4 w-4" />
            Tümünü Okundu İşaretle ({unreadCount})
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
            <Bell className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-sm text-muted-foreground">
              Henüz bildiriminiz bulunmuyor
            </p>
          </div>
        ) : (
          notifications.map((notification) => {
            const Icon = notificationIcons[notification.type] || Bell;
            const colorClass = notificationColors[notification.type] || notificationColors.INFO;

            return (
              <div
                key={notification.id}
                className={`rounded-lg border border-border bg-card p-4 transition-colors ${
                  !notification.isRead ? "bg-muted/30" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold">{notification.title}</h3>
                      {!notification.isRead && (
                        <Badge variant="default" className="bg-primary">Yeni</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    {notification.sender && (
                      <p className="text-xs text-muted-foreground">
                        Gönderen: {notification.sender.name}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleString("tr-TR")}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
