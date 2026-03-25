"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  Plus,
  Edit,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Pause,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  maxUsers: number;
  maxTrainings: number;
  features: string[];
  isActive: boolean;
}

interface HospitalSubscription {
  id: string;
  hospitalId: string;
  hospitalName: string;
  hospitalCode: string | null;
  hospitalCity: string;
  planName: string;
  planPrice: number;
  status: string;
  startDate: string;
  endDate: string;
  trialEndDate: string | null;
  lastPaymentDate: string | null;
  daysRemaining: number;
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: any }
> = {
  ACTIVE: {
    label: "Aktif",
    color: "bg-green-500/10 text-green-700 dark:text-green-400",
    icon: CheckCircle2,
  },
  TRIAL: {
    label: "Deneme",
    color: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    icon: Clock,
  },
  EXPIRING: {
    label: "Yaklaşan",
    color: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    icon: AlertTriangle,
  },
  EXPIRED: {
    label: "Dolmuş",
    color: "bg-red-500/10 text-red-700 dark:text-red-400",
    icon: XCircle,
  },
  SUSPENDED: {
    label: "Askıda",
    color: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
    icon: Pause,
  },
  CANCELLED: {
    label: "İptal",
    color: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
    icon: XCircle,
  },
};

export default function SuperAdminSubscriptions() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<HospitalSubscription[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [isCreatePlanDialogOpen, setIsCreatePlanDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [plansRes, subsRes] = await Promise.all([
        fetch("/api/super-admin/plans"),
        fetch("/api/super-admin/subscriptions"),
      ]);

      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setPlans(plansData);
      }

      if (subsRes.ok) {
        const subsData = await subsRes.json();
        setSubscriptions(subsData);
      }
    } catch (error) {
      console.error("Fetch error:", error);
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
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Abonelik Yönetimi
        </h1>
        <p className="text-sm text-muted-foreground">
          Abonelik planları ve hastane abonelik durumu.
        </p>
      </div>

      {/* Subscription Plans */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Abonelik Planları</h2>
          <Button onClick={() => setIsCreatePlanDialogOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Plan
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-lg border border-border bg-card p-6 shadow-sm"
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>

              <div className="mb-4">
                <p className="text-3xl font-bold">
                  ₺{plan.price.toLocaleString("tr-TR")}
                  <span className="text-sm font-normal text-muted-foreground">
                    /ay
                  </span>
                </p>
              </div>

              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Maksimum Kullanıcı
                  </span>
                  <span className="font-medium">{plan.maxUsers}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Maksimum Eğitim
                  </span>
                  <span className="font-medium">{plan.maxTrainings}</span>
                </div>
              </div>

              <div className="space-y-2">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hospital Subscriptions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Hastane Abonelikleri</h2>

        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Hastane
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Şehir
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Plan
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Durum
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Başlangıç
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Bitiş
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Kalan Gün
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Aylık Ücret
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {subscriptions.map((sub) => {
                const config = statusConfig[sub.status] || statusConfig.ACTIVE;
                const Icon = config.icon;

                return (
                  <tr
                    key={sub.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{sub.hospitalName}</p>
                        {sub.hospitalCode && (
                          <p className="text-xs text-muted-foreground">
                            {sub.hospitalCode}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{sub.hospitalCity}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        {sub.planName}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={config.color}>
                        <Icon className="mr-1 h-3 w-3" />
                        {config.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(sub.startDate).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(sub.endDate).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-sm font-medium ${
                          sub.daysRemaining < 0
                            ? "text-red-600"
                            : sub.daysRemaining < 30
                              ? "text-orange-600"
                              : "text-green-600"
                        }`}
                      >
                        {sub.daysRemaining < 0 ? 0 : sub.daysRemaining} gün
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      ₺{sub.planPrice.toLocaleString("tr-TR")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {subscriptions.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Henüz abonelik bulunmuyor
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aktif Abonelik</p>
              <p className="text-2xl font-bold">
                {
                  subscriptions.filter((s) => s.status === "ACTIVE").length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Yaklaşan</p>
              <p className="text-2xl font-bold">
                {
                  subscriptions.filter((s) => s.status === "EXPIRING").length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dolmuş</p>
              <p className="text-2xl font-bold">
                {
                  subscriptions.filter((s) => s.status === "EXPIRED").length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Toplam Gelir</p>
              <p className="text-2xl font-bold">
                ₺
                {subscriptions
                  .filter(
                    (s) => s.status === "ACTIVE" || s.status === "TRIAL"
                  )
                  .reduce((sum, s) => sum + s.planPrice, 0)
                  .toLocaleString("tr-TR")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
