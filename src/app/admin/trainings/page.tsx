"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrainingListTable } from "@/components/admin/training-list-table";
import { useTrainingList } from "@/store/training-store";
import type { TrainingListItem, TrainingStats } from "@/types/training";

export default function AdminTrainings() {
  const [trainings, setTrainings] = useState<TrainingListItem[]>([]);
  const [stats, setStats] = useState<TrainingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { filters, setFilter, clearFilters } = useTrainingList();

  // Fetch stats
  useEffect(() => {
    fetch("/api/trainings/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Error fetching stats:", err));
  }, []);

  // Fetch trainings
  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.category) params.set("category", filters.category);
    if (filters.search) params.set("search", filters.search);

    fetch(`/api/trainings?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setTrainings(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching trainings:", err);
        setIsLoading(false);
      });
  }, [filters]);

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined && v !== "");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            Eğitim Yönetimi
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Eğitimlerinizi oluşturun, düzenleyin ve personellere atayın
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/admin/trainings/new">
            <Plus className="h-5 w-5 mr-2" />
            Yeni Eğitim
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Eğitim</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTrainings}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.publishedTrainings} yayında
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taslak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.draftTrainings}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Yayına hazır
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Atama</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAssignments}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.completedAssignments} tamamlandı
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tamamlanma Oranı</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">%{stats.averageCompletionRate}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Ortalama puan: {stats.averageScore}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              <Filter className="h-4 w-4 inline mr-2" />
              Filtreler
            </CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Temizle
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Arama</label>
              <Input
                placeholder="Eğitim adı ara..."
                value={filters.search || ""}
                onChange={(e) => setFilter("search", e.target.value || undefined)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Durum</label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) => setFilter("status", value === "all" ? undefined : value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="DRAFT">Taslak</SelectItem>
                  <SelectItem value="PUBLISHED">Yayında</SelectItem>
                  <SelectItem value="ARCHIVED">Arşiv</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Kategori</label>
              <Select
                value={filters.category || "all"}
                onValueChange={(value) => setFilter("category", value === "all" ? undefined : value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="İş Güvenliği">İş Güvenliği</SelectItem>
                  <SelectItem value="Hijyen">Hijyen</SelectItem>
                  <SelectItem value="Teknik">Teknik</SelectItem>
                  <SelectItem value="Hasta Hakları">Hasta Hakları</SelectItem>
                  <SelectItem value="Diğer">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <TrainingListTable data={trainings} isLoading={isLoading} />
    </div>
  );
}
