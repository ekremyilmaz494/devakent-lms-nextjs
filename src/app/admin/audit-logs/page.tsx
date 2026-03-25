"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ChevronLeft, ChevronRight, FileText, User, Calendar } from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  changes: any;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const ACTION_LABELS: Record<string, string> = {
  CREATE_USER: "Kullanıcı Oluşturuldu",
  UPDATE_USER: "Kullanıcı Güncellendi",
  DELETE_USER: "Kullanıcı Silindi",
  ACTIVATE_STAFF: "Personel Aktif Edildi",
  DEACTIVATE_STAFF: "Personel Pasif Edildi",
  CREATE_TRAINING: "Eğitim Oluşturuldu",
  UPDATE_TRAINING: "Eğitim Güncellendi",
  DELETE_TRAINING: "Eğitim Silindi",
  PUBLISH_TRAINING: "Eğitim Yayınlandı",
  UNPUBLISH_TRAINING: "Eğitim Yayından Kaldırıldı",
  ASSIGN_TRAINING: "Eğitim Atandı",
  BULK_ASSIGN_TRAINING: "Toplu Eğitim Ataması",
  APPROVE_CERTIFICATE: "Sertifika Onaylandı",
  REJECT_CERTIFICATE: "Sertifika Reddedildi",
  GRANT_ATTEMPT: "Deneme Hakkı Verildi",
  LOGIN: "Giriş Yapıldı",
  LOGOUT: "Çıkış Yapıldı",
};

const ENTITY_TYPE_LABELS: Record<string, string> = {
  User: "Kullanıcı",
  Training: "Eğitim",
  TrainingAssignment: "Eğitim Ataması",
  Certificate: "Sertifika",
  ExamAttempt: "Sınav Denemesi",
  VideoProgress: "Video İlerlemesi",
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [entityTypeFilter, setEntityTypeFilter] = useState("all");

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, actionFilter, entityTypeFilter]);

  useEffect(() => {
    filterLogs();
  }, [logs, searchQuery]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (actionFilter !== "all") {
        params.append("action", actionFilter);
      }

      if (entityTypeFilter !== "all") {
        params.append("entityType", entityTypeFilter);
      }

      const response = await fetch(`/api/audit-logs?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterLogs = () => {
    if (!searchQuery) {
      setFilteredLogs(logs);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = logs.filter(
      (log) =>
        log.user.name.toLowerCase().includes(query) ||
        log.user.email.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        log.entityType.toLowerCase().includes(query) ||
        (log.entityId && log.entityId.toLowerCase().includes(query))
    );
    setFilteredLogs(filtered);
  };

  const getActionLabel = (action: string) => {
    return ACTION_LABELS[action] || action;
  };

  const getEntityTypeLabel = (entityType: string) => {
    return ENTITY_TYPE_LABELS[entityType] || entityType;
  };

  const getActionColor = (action: string) => {
    if (action.includes("CREATE")) return "bg-green-100 text-green-800";
    if (action.includes("DELETE")) return "bg-red-100 text-red-800";
    if (action.includes("UPDATE")) return "bg-blue-100 text-blue-800";
    if (action.includes("APPROVE")) return "bg-green-100 text-green-800";
    if (action.includes("REJECT")) return "bg-red-100 text-red-800";
    if (action.includes("ASSIGN")) return "bg-purple-100 text-purple-800";
    if (action.includes("LOGIN")) return "bg-gray-100 text-gray-800";
    return "bg-gray-100 text-gray-800";
  };

  if (isLoading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loglar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">İşlem Geçmişi (Audit Logs)</h1>
        <p className="text-muted-foreground">
          Sistemdeki tüm işlemlerin detaylı kaydı
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Kayıt</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bu Sayfa</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredLogs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Sayfa</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.totalPages}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Kullanıcı, işlem veya entity ID ile ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={actionFilter}
              onValueChange={(v) => {
                if (v) {
                  setActionFilter(v);
                  setPagination({ ...pagination, page: 1 });
                }
              }}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="İşlem Tipi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm İşlemler</SelectItem>
                <SelectItem value="CREATE_USER">Kullanıcı Oluştur</SelectItem>
                <SelectItem value="UPDATE_USER">Kullanıcı Güncelle</SelectItem>
                <SelectItem value="ASSIGN_TRAINING">Eğitim Ata</SelectItem>
                <SelectItem value="APPROVE_CERTIFICATE">Sertifika Onayla</SelectItem>
                <SelectItem value="LOGIN">Giriş</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={entityTypeFilter}
              onValueChange={(v) => {
                if (v) {
                  setEntityTypeFilter(v);
                  setPagination({ ...pagination, page: 1 });
                }
              }}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Entity Tipi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Entity'ler</SelectItem>
                <SelectItem value="User">Kullanıcı</SelectItem>
                <SelectItem value="Training">Eğitim</SelectItem>
                <SelectItem value="TrainingAssignment">Atama</SelectItem>
                <SelectItem value="Certificate">Sertifika</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih & Saat</TableHead>
                  <TableHead>Kullanıcı</TableHead>
                  <TableHead>İşlem</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Değişiklikler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <p className="text-muted-foreground">Log kaydı bulunamadı</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs">
                        {new Date(log.createdAt).toLocaleString("tr-TR")}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.user.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {log.user.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getActionColor(log.action)}>
                          {getActionLabel(log.action)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {getEntityTypeLabel(log.entityType)}
                          </div>
                          {log.entityId && (
                            <div className="text-xs text-muted-foreground font-mono">
                              {log.entityId.substring(0, 8)}...
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.changes && (
                          <details className="cursor-pointer">
                            <summary className="text-xs text-blue-600 hover:text-blue-800">
                              Değişiklikleri Gör
                            </summary>
                            <div className="mt-2 p-2 bg-muted rounded text-xs font-mono max-w-md overflow-auto">
                              <pre className="whitespace-pre-wrap">
                                {JSON.stringify(log.changes, null, 2)}
                              </pre>
                            </div>
                          </details>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Sayfa {pagination.page} / {pagination.totalPages} ({pagination.total}{" "}
                kayıt)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page - 1 })
                  }
                  disabled={pagination.page === 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Önceki
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page + 1 })
                  }
                  disabled={pagination.page === pagination.totalPages || isLoading}
                >
                  Sonraki
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
