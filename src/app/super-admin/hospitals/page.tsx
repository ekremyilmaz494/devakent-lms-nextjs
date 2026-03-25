"use client";

import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Hospital = {
  id: string;
  name: string;
  code: string | null;
  city: string;
  staffCount: number;
  trainingCount: number;
  plan: { name: string; price: number } | null;
  subscription: {
    status: string;
    endDate: string;
  } | null;
  isActive: boolean;
};

type Plan = {
  id: string;
  name: string;
  price: number;
};

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  TRIAL: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  EXPIRING: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  EXPIRED: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  SUSPENDED: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Aktif",
  TRIAL: "Deneme",
  EXPIRING: "Yaklaşan",
  EXPIRED: "Dolmuş",
  SUSPENDED: "Askıda",
};

export default function SuperAdminHospitals() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    city: "",
    address: "",
    phone: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    planId: "",
    subscriptionEndDate: "",
  });

  useEffect(() => {
    fetchHospitals();
    fetchPlans();
  }, []);

  async function fetchHospitals() {
    try {
      const res = await fetch("/api/super-admin/hospitals");
      if (res.ok) {
        const data = await res.json();
        setHospitals(data);
      }
    } catch (error) {
      console.error("Fetch hospitals error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPlans() {
    try {
      const res = await fetch("/api/super-admin/plans");
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      }
    } catch (error) {
      console.error("Fetch plans error:", error);
    }
  }

  async function handleAddHospital(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/super-admin/hospitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsAddDialogOpen(false);
        setFormData({
          name: "",
          code: "",
          city: "",
          address: "",
          phone: "",
          adminName: "",
          adminEmail: "",
          adminPassword: "",
          planId: "",
          subscriptionEndDate: "",
        });
        fetchHospitals();
      } else {
        const error = await res.json();
        alert(error.error || "Hastane eklenemedi");
      }
    } catch (error) {
      console.error("Add hospital error:", error);
      alert("Hastane eklenirken hata oluştu");
    }
  }

  const columns: ColumnDef<Hospital>[] = [
    {
      accessorKey: "name",
      header: "Hastane Adı",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.code || "Kod yok"}</p>
        </div>
      ),
    },
    {
      accessorKey: "city",
      header: "Şehir",
    },
    {
      accessorKey: "staffCount",
      header: "Personel",
      cell: ({ row }) => row.original.staffCount.toLocaleString("tr-TR"),
    },
    {
      accessorKey: "trainingCount",
      header: "Eğitim",
      cell: ({ row }) => row.original.trainingCount.toLocaleString("tr-TR"),
    },
    {
      accessorKey: "plan",
      header: "Plan",
      cell: ({ row }) => row.original.plan?.name || "Plan Yok",
    },
    {
      accessorKey: "subscription.status",
      header: "Durum",
      cell: ({ row }) => {
        const status = row.original.subscription?.status;
        if (!status) return <Badge variant="outline">Plan Yok</Badge>;
        return (
          <Badge className={statusColors[status] || ""}>
            {statusLabels[status] || status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Aktif",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "default" : "outline"}>
          {row.original.isActive ? "Aktif" : "Pasif"}
        </Badge>
      ),
    },
  ];

  const table = useReactTable({
    data: hospitals,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hastaneler</h1>
          <p className="text-sm text-muted-foreground">
            Tüm hastaneleri görüntüleyin ve yönetin
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Hastane Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yeni Hastane Ekle</DialogTitle>
              <DialogDescription>
                Hastane bilgilerini, admin kullanıcısını ve abonelik planını girin
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddHospital} className="space-y-4">
              {/* Hastane Bilgileri */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Hastane Bilgileri</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Hastane Adı *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Hastane Kodu *</label>
                    <Input
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Şehir *</label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Telefon</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Adres</label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>

              {/* Admin Kullanıcısı */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Admin Kullanıcısı</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Ad Soyad *</label>
                    <Input
                      value={formData.adminName}
                      onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">E-posta *</label>
                    <Input
                      type="email"
                      value={formData.adminEmail}
                      onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium">Şifre *</label>
                    <Input
                      type="password"
                      value={formData.adminPassword}
                      onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                      required
                      minLength={8}
                    />
                  </div>
                </div>
              </div>

              {/* Abonelik */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Abonelik Planı</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Plan</label>
                    <Select
                      value={formData.planId}
                      onValueChange={(value) => setFormData({ ...formData, planId: value || "" })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Plan seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {plans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.name} - ₺{plan.price.toLocaleString("tr-TR")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Bitiş Tarihi</label>
                    <Input
                      type="date"
                      value={formData.subscriptionEndDate}
                      onChange={(e) =>
                        setFormData({ ...formData, subscriptionEndDate: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  İptal
                </Button>
                <Button type="submit">Hastane Ekle</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Hastane ara..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value || "all")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Durumlar</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="trial">Deneme</SelectItem>
            <SelectItem value="expiring">Yaklaşan</SelectItem>
            <SelectItem value="expired">Dolmuş</SelectItem>
          </SelectContent>
        </Select>
        <Select value={planFilter} onValueChange={(v) => { if (v) setPlanFilter(v); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Planlar</SelectItem>
            {plans.map((plan) => (
              <SelectItem key={plan.id} value={plan.name}>
                {plan.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Sonuç bulunamadı.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} hastane gösteriliyor
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Önceki
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Sonraki
          </Button>
        </div>
      </div>
    </div>
  );
}
