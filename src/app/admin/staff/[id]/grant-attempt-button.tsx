"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";

interface GrantAttemptButtonProps {
  assignmentId: string;
  trainingTitle: string;
}

export default function GrantAttemptButton({ assignmentId, trainingTitle }: GrantAttemptButtonProps) {
  const router = useRouter();
  const [isGranting, setIsGranting] = useState(false);

  const handleGrantAttempt = async () => {
    const confirmMessage = `${trainingTitle} eğitimi için yeni deneme hakkı vermek istediğinize emin misiniz?`;

    if (!confirm(confirmMessage)) return;

    setIsGranting(true);
    try {
      const response = await fetch(`/api/staff/assignments/${assignmentId}/grant-attempt`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Deneme hakkı verilemedi");
      }

      alert("Yeni deneme hakkı başarıyla verildi!");
      // Refresh the page to show updated data
      router.refresh();
    } catch (error: any) {
      console.error("Error granting attempt:", error);
      alert(error.message || "Deneme hakkı verilirken bir hata oluştu");
    } finally {
      setIsGranting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleGrantAttempt}
      disabled={isGranting}
    >
      {isGranting ? (
        <>
          <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
          İşleniyor...
        </>
      ) : (
        "Yeni Deneme Hakkı Ver"
      )}
    </Button>
  );
}
