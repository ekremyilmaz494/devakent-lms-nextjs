"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, Eye, UserCheck, UserX, Upload } from "lucide-react";
import Link from "next/link";

interface Staff {
  id: string;
  name: string;
  email: string;
  tcNo: string | null;
  department: string | null;
  title: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  _count: {
    assignments: number;
  };
  completedTrainings: number;
  successRate: number;
}

export default function AdminStaff() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    tcNo: "",
    password: "",
    department: "",
    title: "",
    phone: "",
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    filterStaff();
  }, [staff, searchQuery, statusFilter, departmentFilter]);

  const fetchStaff = async () => {
    try {
      const response = await fetch("/api/staff");
      if (response.ok) {
        const data = await response.json();
        setStaff(data.staff || []);
      }
    } catch (error) {
      console.error("Failed to fetch staff:", error);
      setStaff([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterStaff = () => {
    let filtered = staff;

    // Status filter
    if (statusFilter === "active") {
      filtered = filtered.filter((s) => s.isActive);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((s) => !s.isActive);
    }

    // Department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter((s) => s.department === departmentFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.email.toLowerCase().includes(query) ||
          s.tcNo?.toLowerCase().includes(query) ||
          s.department?.toLowerCase().includes(query) ||
          s.title?.toLowerCase().includes(query)
      );
    }

    setFilteredStaff(filtered);
  };

  // Get unique departments for filter
  const departments = Array.from(new Set(staff.map(s => s.department).filter(Boolean)));

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsAddDialogOpen(false);
        setFormData({
          name: "",
          email: "",
          tcNo: "",
          password: "",
          department: "",
          title: "",
          phone: "",
        });
        fetchStaff();
      } else {
        const error = await response.json();
        alert(error.error || "Personel eklenemedi");
      }
    } catch (error) {
      console.error("Failed to add staff:", error);
      alert("Bir hata oluştu");
    }
  };

  const handleToggleStatus = async (staffId: string, currentStatus: boolean) => {
    if (!confirm(`Personeli ${currentStatus ? "pasif" : "aktif"} yapmak istediğinize emin misiniz?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/staff/${staffId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      });

      if (response.ok) {
        fetchStaff();
      }
    } catch (error) {
      console.error("Failed to toggle staff status:", error);
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm("Bu personeli silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`/api/staff/${staffId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchStaff();
      } else {
        const error = await response.json();
        alert(error.error || "Personel silinemedi");
      }
    } catch (error) {
      console.error("Failed to delete staff:", error);
      alert("Bir hata oluştu");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Personeller yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Personel Yönetimi</h1>
          <p className="text-muted-foreground">
            Personel ekleyin, düzenleyin ve yönetin
          </p>
        </div>

        <div className="flex gap-2">
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Toplu İçe Aktar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Excel Dosyasından Personel İçe Aktar</DialogTitle>
                <DialogDescription>
                  Excel dosyanızı yükleyin. Dosya formatı: Ad Soyad, TC No, E-posta, Departman, Ünvan, Telefon
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="excel-file">Excel Dosyası (.xlsx, .xls)</Label>
                  <Input
                    id="excel-file"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => {
                      // Excel import işlemi - sonraki fazda implement edilecek
                      alert("Excel import özelliği yakında eklenecek");
                      setIsImportDialogOpen(false);
                    }}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-2">Örnek Format:</p>
                  <code className="block bg-muted p-2 rounded text-xs">
                    Ad Soyad | TC No | E-posta | Departman | Ünvan | Telefon
                  </code>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Personel Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleAddStaff}>
              <DialogHeader>
                <DialogTitle>Yeni Personel Ekle</DialogTitle>
                <DialogDescription>
                  Yeni personel bilgilerini girin
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Ad Soyad *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">E-posta *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="tcNo">TC Kimlik No</Label>
                  <Input
                    id="tcNo"
                    value={formData.tcNo}
                    onChange={(e) =>
                      setFormData({ ...formData, tcNo: e.target.value })
                    }
                    maxLength={11}
                    placeholder="11 haneli TC No"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">Şifre *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    minLength={6}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="department">Departman</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="title">Ünvan</Label>
                  <Input
                    id="title"
                    placeholder="örn: Hemşire, Doktor, Teknisyen"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  İptal
                </Button>
                <Button type="submit">Ekle</Button>
              </DialogFooter>
            </form>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Personel
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staff.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {staff.filter((s) => s.isActive).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pasif</CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {staff.filter((s) => !s.isActive).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Personel ara (ad, TC, email, departman, ünvan)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={departmentFilter} onValueChange={(v) => { if (v) setDepartmentFilter(v); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Departman" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Departmanlar</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept!}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { if (v) setStatusFilter(v); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Pasif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {filteredStaff.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Personel bulunamadı</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad Soyad</TableHead>
                  <TableHead>TC No</TableHead>
                  <TableHead>E-posta</TableHead>
                  <TableHead>Departman</TableHead>
                  <TableHead>Ünvan</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Eğitimler</TableHead>
                  <TableHead>Başarı Oranı</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>
                      {member.tcNo || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      {member.department || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {member.title || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {member.isActive ? (
                        <Badge variant="default" className="bg-green-500">
                          Aktif
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Pasif</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="font-medium">
                          {member.completedTrainings}
                        </span>{" "}
                        / {member._count.assignments}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium">
                          {member.successRate.toFixed(0)}%
                        </div>
                        <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              member.successRate >= 80 ? 'bg-green-500' :
                              member.successRate >= 60 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${member.successRate}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          title="Detay"
                        >
                          <Link href={`/admin/staff/${member.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleToggleStatus(member.id, member.isActive)
                          }
                          title={member.isActive ? "Pasif Yap" : "Aktif Yap"}
                        >
                          {member.isActive ? (
                            <UserX className="h-4 w-4 text-orange-500" />
                          ) : (
                            <UserCheck className="h-4 w-4 text-green-500" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteStaff(member.id)}
                          title="Sil"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
