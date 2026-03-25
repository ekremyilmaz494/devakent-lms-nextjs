"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Users, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BulkAssignDialogProps {
  trainingId: string;
  onSuccess?: () => void;
}

export function BulkAssignDialog({ trainingId, onSuccess }: BulkAssignDialogProps) {
  const [open, setOpen] = useState(false);
  const [assignType, setAssignType] = useState<"all" | "department">("all");
  const [department, setDepartment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleBulkAssign = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch(`/api/trainings/${trainingId}/bulk-assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignType, department: assignType === "department" ? department : undefined }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, message: data.message || `${data.assignedCount} personele atandı` });
        setTimeout(() => {
          setOpen(false);
          setResult(null);
          onSuccess?.();
        }, 2000);
      } else {
        setResult({ success: false, message: data.error || "Bir hata oluştu" });
      }
    } catch (error) {
      setResult({ success: false, message: "Bağlantı hatası" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><Users className="mr-2 h-4 w-4" />Toplu Atama</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Toplu Personel Ataması</DialogTitle>
          <DialogDescription>Birden fazla personele aynı anda eğitim atayın</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Atama Tipi</Label>
            <Select value={assignType} onValueChange={(v: any) => setAssignType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Personeller</SelectItem>
                <SelectItem value="department">Departmana Göre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {assignType === "department" && (
            <div className="space-y-2">
              <Label>Departman</Label>
              <Input placeholder="Örn: Hemşirelik, IT" value={department} onChange={(e) => setDepartment(e.target.value)} />
            </div>
          )}

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>İptal</Button>
          <Button onClick={handleBulkAssign} disabled={isLoading || (assignType === "department" && !department)}>
            {isLoading ? "Atanıyor..." : "Ata"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
