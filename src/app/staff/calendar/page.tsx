"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { CheckCircle2, Clock, AlertTriangle, Lock } from "lucide-react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const FullCalendar = dynamic(() => import("@fullcalendar/react"), { ssr: false });

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
}

export default function StaffCalendar() {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const res = await fetch("/api/staff/calendar");
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events);
      }
    } catch (error) {
      console.error("Calendar fetch error:", error);
    } finally {
      setLoading(false);
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
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Eğitim Takvimi</h1>
        <p className="text-sm text-muted-foreground">Eğitim takviminiz — aylık, haftalık, günlük görünüm.</p>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded" style={{ backgroundColor: "#22c55e" }} />
          <span className="text-sm"><CheckCircle2 className="mr-1 inline h-4 w-4" />Tamamlandı</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded" style={{ backgroundColor: "#f97316" }} />
          <span className="text-sm"><Clock className="mr-1 inline h-4 w-4" />Devam Ediyor</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded" style={{ backgroundColor: "#ef4444" }} />
          <span className="text-sm"><AlertTriangle className="mr-1 inline h-4 w-4" />Yaklaşan Deadline</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded" style={{ backgroundColor: "#3b82f6" }} />
          <span className="text-sm">Başlanmadı</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded" style={{ backgroundColor: "#6b7280" }} />
          <span className="text-sm"><Lock className="mr-1 inline h-4 w-4" />Kilitli</span>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-center text-sm text-muted-foreground py-8">
          Takvim görünümü geliştirme aşamasında. Şimdilik eğitimlerinizi "Eğitimlerim" sayfasından takip edebilirsiniz.
        </p>
      </div>

      {events.length === 0 && (
        <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">Henüz size atanmış eğitim bulunmuyor</p>
        </div>
      )}
    </div>
  );
}
