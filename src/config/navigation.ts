import {
  LayoutDashboard,
  Building2,
  CreditCard,
  BarChart3,
  Settings,
  ScrollText,
  GraduationCap,
  Users,
  Bell,
  Database,
  BookOpen,
  Calendar,
  User,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const superAdminNavigation: NavGroup[] = [
  {
    label: "Genel",
    items: [
      {
        title: "Dashboard",
        href: "/super-admin/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Hastaneler",
        href: "/super-admin/hospitals",
        icon: Building2,
      },
      {
        title: "Abonelikler",
        href: "/super-admin/subscriptions",
        icon: CreditCard,
      },
    ],
  },
  {
    label: "Analiz",
    items: [
      {
        title: "Raporlar",
        href: "/super-admin/reports",
        icon: BarChart3,
      },
      {
        title: "Audit Log",
        href: "/super-admin/audit-logs",
        icon: ScrollText,
      },
    ],
  },
  {
    label: "Sistem",
    items: [
      {
        title: "Bildirimler",
        href: "/super-admin/notifications",
        icon: Bell,
      },
      {
        title: "Yedekleme",
        href: "/super-admin/backup",
        icon: Database,
      },
      {
        title: "Ayarlar",
        href: "/super-admin/settings",
        icon: Settings,
      },
    ],
  },
];

export const adminNavigation: NavGroup[] = [
  {
    label: "Genel",
    items: [
      {
        title: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Egitimler",
        href: "/admin/trainings",
        icon: GraduationCap,
      },
      {
        title: "Personel",
        href: "/admin/staff",
        icon: Users,
      },
    ],
  },
  {
    label: "Analiz",
    items: [
      {
        title: "Analytics",
        href: "/admin/analytics",
        icon: BarChart3,
      },
      {
        title: "Raporlar",
        href: "/admin/reports",
        icon: ScrollText,
      },
      {
        title: "Bildirimler",
        href: "/admin/notifications",
        icon: Bell,
      },
    ],
  },
  {
    label: "Sistem",
    items: [
      {
        title: "Yedekleme",
        href: "/admin/backup",
        icon: Database,
      },
      {
        title: "Ayarlar",
        href: "/admin/settings",
        icon: Settings,
      },
    ],
  },
];

export const staffNavigation: NavGroup[] = [
  {
    label: "Genel",
    items: [
      {
        title: "Dashboard",
        href: "/staff/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Egitimlerim",
        href: "/staff/my-trainings",
        icon: BookOpen,
      },
      {
        title: "Takvim",
        href: "/staff/calendar",
        icon: Calendar,
      },
    ],
  },
  {
    label: "Hesap",
    items: [
      {
        title: "Raporlarım",
        href: "/staff/reports",
        icon: ScrollText,
      },
      {
        title: "Bildirimler",
        href: "/staff/notifications",
        icon: Bell,
      },
      {
        title: "Profilim",
        href: "/staff/profile",
        icon: User,
      },
    ],
  },
];
