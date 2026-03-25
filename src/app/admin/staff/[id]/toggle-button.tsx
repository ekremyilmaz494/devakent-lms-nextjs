"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserCheck, UserX, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";

interface StaffToggleButtonProps {
  staffId: string;
  isActive: boolean;
  staffName: string;
}

export default function StaffToggleButton({ staffId, isActive, staffName }: StaffToggleButtonProps) {
  const router = useRouter();
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const handleToggleStatus = async () => {
    const confirmMessage = isActive
      ? `${staffName} kullanıcısını pasif hale getirmek istediğinize emin misiniz?`
      : `${staffName} kullanıcısını aktif hale getirmek istediğinize emin misiniz?`;

    if (!confirm(confirmMessage)) return;

    setIsTogglingStatus(true);
    try {
      const response = await fetch(`/api/staff/${staffId}/toggle-status`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Durum değiştirilemedi");
      }

      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      console.error("Error toggling status:", error);
      alert("Durum değiştirirken bir hata oluştu");
    } finally {
      setIsTogglingStatus(false);
    }
  };

  return (
    <Button
      variant={isActive ? "destructive" : "default"}
      onClick={handleToggleStatus}
      disabled={isTogglingStatus}
    >
      {isTogglingStatus ? (
        <>
          <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
          İşleniyor...
        </>
      ) : (
        <>
          {isActive ? <UserX className="h-4 w-4 mr-2" /> : <UserCheck className="h-4 w-4 mr-2" />}
          {isActive ? "Pasif Yap" : "Aktif Yap"}
        </>
      )}
    </Button>
  );
}
