"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  changes: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  hospital: {
    id: string;
    name: string;
    city: string;
  } | null;
}

interface AuditLogsResponse {
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const actionColors: Record<string, string> = {
  CREATE: "bg-green-500/10 text-green-700 dark:text-green-400",
  UPDATE: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  DELETE: "bg-red-500/10 text-red-700 dark:text-red-400",
  LOGIN: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  LOGOUT: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
};

export default function SuperAdminAuditLogs() {
  const [data, setData] = useState<AuditLogsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLogs();
  }, [page]);

  async function fetchLogs() {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/super-admin/audit-logs?page=${page}&limit=50`
      );
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error("Audit logs fetch error:", error);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleString("tr-TR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading && !data) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const filteredLogs =
    data?.logs.filter(
      (log) =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.hospital?.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Platform Audit Log
        </h1>
        <p className="text-sm text-muted-foreground">
          Tüm hastanelerdeki sistem işlemleri ve değişiklikler.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="İşlem, varlık, kullanıcı veya hastane ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filtrele
        </Button>
      </div>

      {/* Audit Logs Table */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Tarih/Saat
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                İşlem
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Varlık
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Kullanıcı
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Hastane
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                IP Adresi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredLogs.map((log) => (
              <tr
                key={log.id}
                className="hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3 text-sm">
                  {formatDate(log.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    className={
                      actionColors[log.action] || actionColors.UPDATE
                    }
                  >
                    {log.action}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{log.entity}</p>
                    <p className="text-xs text-muted-foreground">
                      ID: {log.entityId.substring(0, 8)}...
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {log.user ? (
                    <div>
                      <p className="text-sm font-medium">{log.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.user.role}
                      </p>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Sistem
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {log.hospital ? (
                    <div>
                      <p className="text-sm font-medium">
                        {log.hospital.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {log.hospital.city}
                      </p>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {log.ipAddress || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredLogs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <FileText className="mb-2 h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              {searchTerm
                ? "Arama kriterlerine uygun log bulunamadı"
                : "Henüz audit log kaydı bulunmuyor"}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Toplam {data.pagination.total} kayıt, sayfa {data.pagination.page}{" "}
            / {data.pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              Önceki
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === data.pagination.totalPages || loading}
            >
              Sonraki
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
