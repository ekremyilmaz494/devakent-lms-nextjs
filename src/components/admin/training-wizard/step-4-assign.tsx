"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Users, AlertCircle, CheckCircle2, User } from "lucide-react";
import { useTrainingWizard } from "@/store/training-store";
import { cn } from "@/lib/utils";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  department?: string | null;
  avatarUrl?: string | null;
}

interface Step4AssignProps {
  onValid?: () => void;
}

export function Step4Assign({ onValid }: Step4AssignProps) {
  const { assignment, setAssignment, markStepComplete } = useTrainingWizard();

  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  const selectedUserIds = assignment.userIds || [];

  // Fetch staff members
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/staff");

        if (!response.ok) {
          throw new Error("Personel listesi alınamadı");
        }

        const data = await response.json();
        setStaffList(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching staff:", error);
        setStaffList([]);
        setIsLoading(false);
      }
    };

    fetchStaff();
  }, []);

  // Filter staff
  const filteredStaff = staffList.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment =
      selectedDepartment === "all" || staff.department === selectedDepartment;

    return matchesSearch && matchesDepartment;
  });

  // Get unique departments
  const departments = Array.from(new Set(staffList.map((s) => s.department).filter(Boolean)));

  // Handle selection
  const handleToggleUser = (userId: string) => {
    const newSelection = selectedUserIds.includes(userId)
      ? selectedUserIds.filter((id) => id !== userId)
      : [...selectedUserIds, userId];

    setAssignment({ userIds: newSelection });
  };

  const handleSelectAll = () => {
    const allIds = filteredStaff.map((s) => s.id);
    setAssignment({ userIds: allIds });
  };

  const handleDeselectAll = () => {
    setAssignment({ userIds: [] });
  };

  // Validation
  const isValid = selectedUserIds.length >= 1;

  useEffect(() => {
    if (isValid) {
      markStepComplete(3);
      onValid?.();
    }
  }, [isValid, markStepComplete, onValid]);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Personel Seçimi</CardTitle>
          <CardDescription>
            Eğitimi atamak istediğiniz personelleri seçin. Bu personeller eğitime otomatik olarak
            atanacaktır.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 rounded-lg border p-4 bg-muted/50">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold">{selectedUserIds.length}</p>
              <p className="text-sm text-muted-foreground">Personel seçildi</p>
            </div>
            {selectedUserIds.length > 0 && (
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Personel ara (isim veya email)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="all">Tüm Departmanlar</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Bulk Actions */}
          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">
              {filteredStaff.length} personel gösteriliyor
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-sm font-medium text-primary hover:underline"
              >
                Tümünü Seç
              </button>
              <span className="text-muted-foreground">•</span>
              <button
                type="button"
                onClick={handleDeselectAll}
                className="text-sm font-medium text-primary hover:underline"
              >
                Tümünü Kaldır
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff List */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-5 w-5 rounded" />
                </div>
              ))}
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="py-12 text-center">
              <User className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">
                Personel bulunamadı. Farklı kriterler deneyin.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredStaff.map((staff) => {
                const isSelected = selectedUserIds.includes(staff.id);

                return (
                  <label
                    key={staff.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50",
                      isSelected && "border-primary bg-primary/5"
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggleUser(staff.id)}
                    />

                    <Avatar className="h-10 w-10">
                      <AvatarImage src={staff.avatarUrl || undefined} alt={staff.name} />
                      <AvatarFallback>
                        {staff.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <p className="font-medium">{staff.name}</p>
                      <p className="text-sm text-muted-foreground">{staff.email}</p>
                    </div>

                    {staff.department && (
                      <Badge variant="outline" className="shrink-0">
                        {staff.department}
                      </Badge>
                    )}
                  </label>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validation Alert */}
      {!isValid && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            En az 1 personel seçmelisiniz. Eğitimi daha sonra da atayabilirsiniz.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
