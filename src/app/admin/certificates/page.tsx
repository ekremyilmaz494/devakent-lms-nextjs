"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Award, Check, X, Clock, Search } from "lucide-react";

interface Certificate {
  id: string;
  certificateNo: string;
  status: string;
  createdAt: string;
  approvedAt: string | null;
  pdfUrl: string | null;
  user: { id: string; name: string; email: string; department: string | null; hospital: string | null };
  training: { id: string; title: string; category: string | null };
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCerts, setFilteredCerts] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; certId: string | null; reason: string }>({ open: false, certId: null, reason: "" });

  useEffect(() => {
    fetchCertificates();
  }, [statusFilter]);

  useEffect(() => {
    filterCertificates();
  }, [certificates, searchQuery]);

  const fetchCertificates = async () => {
    try {
      const response = await fetch(`/api/certificates?status=${statusFilter}`);
      if (response.ok) {
        const data = await response.json();
        setCertificates(data.certificates);
      }
    } catch (error) {
      console.error("Failed to fetch certificates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCertificates = () => {
    let filtered = certificates;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.user.name.toLowerCase().includes(query) ||
          c.training.title.toLowerCase().includes(query) ||
          c.certificateNo.toLowerCase().includes(query)
      );
    }
    setFilteredCerts(filtered);
  };

  const handleApprove = async (certId: string) => {
    if (!confirm("Bu sertifikayı onaylamak istediğinize emin misiniz?")) return;

    try {
      const response = await fetch(`/api/certificates/${certId}/approve`, { method: "POST" });
      if (response.ok) {
        fetchCertificates();
      }
    } catch (error) {
      console.error("Failed to approve certificate:", error);
    }
  };

  const handleReject = async () => {
    if (!rejectDialog.certId || !rejectDialog.reason) return;

    try {
      const response = await fetch(`/api/certificates/${rejectDialog.certId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectDialog.reason }),
      });
      if (response.ok) {
        setRejectDialog({ open: false, certId: null, reason: "" });
        fetchCertificates();
      }
    } catch (error) {
      console.error("Failed to reject certificate:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const pendingCount = certificates.filter((c) => c.status === "PENDING").length;
  const approvedCount = certificates.filter((c) => c.status === "APPROVED").length;
  const rejectedCount = certificates.filter((c) => c.status === "REJECTED").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sertifika Yönetimi</h1>
        <p className="text-muted-foreground">Sertifikaları onaylayın veya reddedin</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Onaylanan</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reddedilen</CardTitle>
            <X className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Personel, eğitim veya sertifika no ile ara..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { if (v) setStatusFilter(v); setIsLoading(true); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="pending">Bekleyen</SelectItem>
                <SelectItem value="approved">Onaylanan</SelectItem>
                <SelectItem value="rejected">Reddedilen</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {filteredCerts.length === 0 ? (
            <div className="text-center py-8"><p className="text-muted-foreground">Sertifika bulunamadı</p></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sertifika No</TableHead>
                  <TableHead>Personel</TableHead>
                  <TableHead>Eğitim</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCerts.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell className="font-mono text-sm">{cert.certificateNo}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{cert.user.name}</div>
                        <div className="text-xs text-muted-foreground">{cert.user.department || "Belirtilmemiş"}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{cert.training.title}</div>
                        {cert.training.category && <Badge variant="secondary" className="mt-1">{cert.training.category}</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(cert.createdAt).toLocaleDateString("tr-TR")}</TableCell>
                    <TableCell>
                      <Badge variant={cert.status === "APPROVED" ? "default" : cert.status === "PENDING" ? "secondary" : "destructive"}>
                        {cert.status === "APPROVED" ? "Onaylandı" : cert.status === "PENDING" ? "Bekliyor" : "Reddedildi"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {cert.status === "PENDING" && (
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="default" onClick={() => handleApprove(cert.id)}><Check className="h-4 w-4 mr-1" />Onayla</Button>
                          <Button size="sm" variant="destructive" onClick={() => setRejectDialog({ open: true, certId: cert.id, reason: "" })}><X className="h-4 w-4 mr-1" />Reddet</Button>
                        </div>
                      )}
                      {cert.status === "APPROVED" && cert.pdfUrl && (
                        <Button size="sm" variant="outline" asChild><a href={cert.pdfUrl} target="_blank" rel="noopener noreferrer"><Award className="h-4 w-4 mr-1" />İndir</a></Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ ...rejectDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sertifikayı Reddet</DialogTitle>
            <DialogDescription>Lütfen red sebebini belirtin (en az 10 karakter)</DialogDescription>
          </DialogHeader>
          <Textarea placeholder="Red sebebi..." value={rejectDialog.reason} onChange={(e) => setRejectDialog({ ...rejectDialog, reason: e.target.value })} rows={4} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, certId: null, reason: "" })}>İptal</Button>
            <Button variant="destructive" onClick={handleReject} disabled={rejectDialog.reason.length < 10}>Reddet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
