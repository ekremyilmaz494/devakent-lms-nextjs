"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download, TrendingUp, Users, Award, BookOpen, Building2, FolderTree } from "lucide-react";

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Report data states
  const [overviewData, setOverviewData] = useState<any>(null);
  const [trainingsData, setTrainingsData] = useState<any[]>([]);
  const [staffData, setStaffData] = useState<any[]>([]);
  const [departmentsData, setDepartmentsData] = useState<any[]>([]);
  const [categoriesData, setCategoriesData] = useState<any[]>([]);
  const [certificatesData, setCertificatesData] = useState<any>(null);

  useEffect(() => {
    fetchReport(activeTab);
  }, [activeTab, startDate, endDate]);

  const fetchReport = async (reportType: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ type: reportType });
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await fetch(`/api/reports?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();

        switch (reportType) {
          case "overview":
            setOverviewData(data.overview);
            break;
          case "trainings":
            setTrainingsData(data.trainings || []);
            break;
          case "staff":
            setStaffData(data.staff || []);
            break;
          case "departments":
            setDepartmentsData(data.departments || []);
            break;
          case "categories":
            setCategoriesData(data.categories || []);
            break;
          case "certificates":
            setCertificatesData(data);
            break;
        }
      }
    } catch (error) {
      console.error("Failed to fetch report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    // CSV export fonksiyonu - gelecekte implement edilecek
    alert("CSV export fonksiyonu yakında eklenecek");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Raporlar</h1>
          <p className="text-muted-foreground">
            Detaylı eğitim, personel ve departman raporları
          </p>
        </div>
        <Button onClick={handleExportCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          CSV İndir
        </Button>
      </div>

      {/* Date Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Tarih Filtresi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Başlangıç Tarihi</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">Bitiş Tarihi</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
              >
                Temizle
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Genel</TabsTrigger>
          <TabsTrigger value="trainings">Eğitimler</TabsTrigger>
          <TabsTrigger value="staff">Personel</TabsTrigger>
          <TabsTrigger value="departments">Departmanlar</TabsTrigger>
          <TabsTrigger value="categories">Kategoriler</TabsTrigger>
          <TabsTrigger value="certificates">Sertifikalar</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Yükleniyor...</p>
            </div>
          ) : overviewData ? (
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Toplam Eğitim</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overviewData.totalTrainings}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Toplam Personel</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overviewData.totalStaff}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Toplam Atama</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overviewData.totalAssignments}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {overviewData.completedAssignments}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tamamlanma Oranı</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overviewData.completionRate}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Toplam Sertifika</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overviewData.totalCertificates}</div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </TabsContent>

        {/* Trainings Tab */}
        <TabsContent value="trainings">
          <Card>
            <CardHeader>
              <CardTitle>Eğitim Raporu</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Yükleniyor...</p>
                </div>
              ) : trainingsData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Eğitim bulunamadı</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Eğitim Adı</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Atama</TableHead>
                      <TableHead>Tamamlanan</TableHead>
                      <TableHead>Başarılı</TableHead>
                      <TableHead>Başarısız</TableHead>
                      <TableHead>Başarı Oranı</TableHead>
                      <TableHead>Ort. Puan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trainingsData.map((training) => (
                      <TableRow key={training.id}>
                        <TableCell className="font-medium">{training.title}</TableCell>
                        <TableCell>
                          {training.category ? (
                            <Badge variant="secondary">{training.category}</Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>{training.totalAssignments}</TableCell>
                        <TableCell>{training.completed}</TableCell>
                        <TableCell className="text-green-600">{training.passed}</TableCell>
                        <TableCell className="text-red-600">{training.failed}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              training.successRate >= 70
                                ? "bg-green-100 text-green-800"
                                : training.successRate >= 50
                                ? "bg-orange-100 text-orange-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {training.successRate}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {training.averageScore} / {training.passingScore}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <CardTitle>Personel Raporu</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Yükleniyor...</p>
                </div>
              ) : staffData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Personel bulunamadı</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Personel</TableHead>
                      <TableHead>TC No</TableHead>
                      <TableHead>Ünvan</TableHead>
                      <TableHead>Departman</TableHead>
                      <TableHead>Atama</TableHead>
                      <TableHead>Tamamlanan</TableHead>
                      <TableHead>Başarılı</TableHead>
                      <TableHead>Başarı Oranı</TableHead>
                      <TableHead>Ort. Puan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffData.map((person) => (
                      <TableRow key={person.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{person.name}</div>
                            <div className="text-xs text-muted-foreground">{person.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{person.tcNo || "-"}</TableCell>
                        <TableCell>{person.title || "-"}</TableCell>
                        <TableCell>{person.department || "-"}</TableCell>
                        <TableCell>{person.totalAssignments}</TableCell>
                        <TableCell>{person.completed}</TableCell>
                        <TableCell className="text-green-600">{person.passed}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              person.successRate >= 70
                                ? "bg-green-100 text-green-800"
                                : person.successRate >= 50
                                ? "bg-orange-100 text-orange-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {person.successRate}%
                          </Badge>
                        </TableCell>
                        <TableCell>{person.averageScore}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments">
          <Card>
            <CardHeader>
              <CardTitle>Departman Raporu</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Yükleniyor...</p>
                </div>
              ) : departmentsData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Departman bulunamadı</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Departman</TableHead>
                      <TableHead>Personel Sayısı</TableHead>
                      <TableHead>Toplam Atama</TableHead>
                      <TableHead>Tamamlanan</TableHead>
                      <TableHead>Başarılı</TableHead>
                      <TableHead>Tamamlanma Oranı</TableHead>
                      <TableHead>Başarı Oranı</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departmentsData.map((dept, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            {dept.department}
                          </div>
                        </TableCell>
                        <TableCell>{dept.staffCount}</TableCell>
                        <TableCell>{dept.totalAssignments}</TableCell>
                        <TableCell>{dept.completed}</TableCell>
                        <TableCell className="text-green-600">{dept.passed}</TableCell>
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-800">
                            {dept.completionRate}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              dept.successRate >= 70
                                ? "bg-green-100 text-green-800"
                                : dept.successRate >= 50
                                ? "bg-orange-100 text-orange-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {dept.successRate}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Kategori Raporu</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Yükleniyor...</p>
                </div>
              ) : categoriesData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Kategori bulunamadı</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Eğitim Sayısı</TableHead>
                      <TableHead>Toplam Atama</TableHead>
                      <TableHead>Tamamlanan</TableHead>
                      <TableHead>Başarılı</TableHead>
                      <TableHead>Başarı Oranı</TableHead>
                      <TableHead>Ortalama Puan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoriesData.map((cat, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <FolderTree className="h-4 w-4 text-muted-foreground" />
                            {cat.category}
                          </div>
                        </TableCell>
                        <TableCell>{cat.trainingCount}</TableCell>
                        <TableCell>{cat.totalAssignments}</TableCell>
                        <TableCell>{cat.completed}</TableCell>
                        <TableCell className="text-green-600">{cat.passed}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              cat.successRate >= 70
                                ? "bg-green-100 text-green-800"
                                : cat.successRate >= 50
                                ? "bg-orange-100 text-orange-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {cat.successRate}%
                          </Badge>
                        </TableCell>
                        <TableCell>{cat.averageScore}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certificates Tab */}
        <TabsContent value="certificates">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Yükleniyor...</p>
            </div>
          ) : certificatesData ? (
            <>
              <div className="grid gap-4 md:grid-cols-4 mb-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Toplam</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{certificatesData.summary.total}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Bekleyen</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {certificatesData.summary.pending}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Onaylanan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {certificatesData.summary.approved}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Onay Oranı</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {certificatesData.summary.approvalRate}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Sertifika Detayları</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sertifika No</TableHead>
                        <TableHead>Personel</TableHead>
                        <TableHead>Eğitim</TableHead>
                        <TableHead>Departman</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead>Tarih</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {certificatesData.certificates.map((cert: any) => (
                        <TableRow key={cert.id}>
                          <TableCell className="font-mono text-sm">{cert.certificateNo}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{cert.userName}</div>
                              <div className="text-xs text-muted-foreground">{cert.userEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{cert.trainingTitle}</div>
                              {cert.trainingCategory && (
                                <Badge variant="secondary" className="mt-1">
                                  {cert.trainingCategory}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{cert.userDepartment || "-"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                cert.status === "APPROVED"
                                  ? "default"
                                  : cert.status === "PENDING"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {cert.status === "APPROVED"
                                ? "Onaylandı"
                                : cert.status === "PENDING"
                                ? "Bekliyor"
                                : "Reddedildi"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(cert.createdAt).toLocaleDateString("tr-TR")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}
