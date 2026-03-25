"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bell, Send, FileText, Users, CheckCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  message: string;
  type: string;
}

interface SentNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  sender: { id: string; name: string; email: string };
  recipientCount: number;
  readCount: number;
}

interface Staff {
  id: string;
  name: string;
  email: string;
  department: string | null;
}

export default function AdminNotifications() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [sentNotifications, setSentNotifications] = useState<SentNotification[]>([]);
  const [allStaff, setAllStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("INFO");
  const [sendToAll, setSendToAll] = useState(true);
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [link, setLink] = useState("");

  // Dialog state
  const [templateDialog, setTemplateDialog] = useState(false);

  useEffect(() => {
    fetchTemplates();
    fetchSentNotifications();
    fetchAllStaff();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/notifications/templates");
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    }
  };

  const fetchSentNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/notifications/sent");
      if (response.ok) {
        const data = await response.json();
        setSentNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Failed to fetch sent notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllStaff = async () => {
    try {
      const response = await fetch("/api/staff");
      if (response.ok) {
        const data = await response.json();
        setAllStaff(data.staff || []);
      }
    } catch (error) {
      console.error("Failed to fetch staff:", error);
    }
  };

  const handleSendNotification = async () => {
    if (!title || !message) {
      alert("Lütfen başlık ve mesaj giriniz");
      return;
    }

    if (!sendToAll && selectedStaffIds.length === 0) {
      alert("Lütfen en az bir personel seçiniz");
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          message,
          type,
          sendToAll,
          receiverIds: sendToAll ? [] : selectedStaffIds,
          link: link || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        // Reset form
        setTitle("");
        setMessage("");
        setLink("");
        setSelectedStaffIds([]);
        fetchSentNotifications();
      } else {
        const error = await response.json();
        alert(error.error || "Bildirim gönderilemedi");
      }
    } catch (error) {
      console.error("Failed to send notification:", error);
      alert("Bildirim gönderilirken bir hata oluştu");
    } finally {
      setIsSending(false);
    }
  };

  const handleUseTemplate = (template: NotificationTemplate) => {
    setTitle(template.title);
    setMessage(template.message);
    setType(template.type);
    setTemplateDialog(false);
  };

  const handleToggleStaff = (staffId: string) => {
    if (selectedStaffIds.includes(staffId)) {
      setSelectedStaffIds(selectedStaffIds.filter((id) => id !== staffId));
    } else {
      setSelectedStaffIds([...selectedStaffIds, staffId]);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "SUCCESS":
        return "bg-green-100 text-green-800";
      case "ERROR":
        return "bg-red-100 text-red-800";
      case "WARNING":
        return "bg-orange-100 text-orange-800";
      case "INFO":
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bildirim Yönetimi</h1>
        <p className="text-muted-foreground">
          Personellere bildirim gönderin ve geçmişi görüntüleyin
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gönderim</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sentNotifications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Şablon Sayısı</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Personel</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allStaff.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="send" className="space-y-4">
        <TabsList>
          <TabsTrigger value="send">Bildirim Gönder</TabsTrigger>
          <TabsTrigger value="history">Gönderim Geçmişi</TabsTrigger>
          <TabsTrigger value="templates">Şablonlar</TabsTrigger>
        </TabsList>

        {/* Send Notification Tab */}
        <TabsContent value="send">
          <Card>
            <CardHeader>
              <CardTitle>Yeni Bildirim Gönder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Başlık</label>
                  <Input
                    placeholder="Bildirim başlığı"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tip</label>
                  <Select value={type} onValueChange={(value) => setType(value || "INFO")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INFO">Bilgi</SelectItem>
                      <SelectItem value="SUCCESS">Başarılı</SelectItem>
                      <SelectItem value="WARNING">Uyarı</SelectItem>
                      <SelectItem value="ERROR">Hata</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mesaj</label>
                <Textarea
                  placeholder="Bildirim mesajı"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Link (Opsiyonel)</label>
                <Input
                  placeholder="/trainings/123"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sendToAll"
                  checked={sendToAll}
                  onCheckedChange={(checked) => setSendToAll(checked === true)}
                />
                <label htmlFor="sendToAll" className="text-sm font-medium cursor-pointer">
                  Tüm personellere gönder
                </label>
              </div>

              {!sendToAll && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Personel Seç ({selectedStaffIds.length} seçili)
                  </label>
                  <div className="max-h-48 overflow-y-auto border rounded-lg p-4 space-y-2">
                    {allStaff.map((staff) => (
                      <div key={staff.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={staff.id}
                          checked={selectedStaffIds.includes(staff.id)}
                          onCheckedChange={() => handleToggleStaff(staff.id)}
                        />
                        <label htmlFor={staff.id} className="text-sm cursor-pointer flex-1">
                          {staff.name} ({staff.email}) - {staff.department || "Belirtilmemiş"}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={() => setTemplateDialog(true)} variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Şablon Kullan
                </Button>
                <Button onClick={handleSendNotification} disabled={isSending}>
                  <Send className="h-4 w-4 mr-2" />
                  {isSending ? "Gönderiliyor..." : "Bildirim Gönder"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Gönderim Geçmişi</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Yükleniyor...</p>
                </div>
              ) : sentNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Henüz bildirim gönderilmedi</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Başlık</TableHead>
                      <TableHead>Tip</TableHead>
                      <TableHead>Gönderen</TableHead>
                      <TableHead>Alıcı</TableHead>
                      <TableHead>Okunma</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sentNotifications.map((notif) => (
                      <TableRow key={notif.id}>
                        <TableCell className="text-xs">
                          {new Date(notif.createdAt).toLocaleString("tr-TR")}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{notif.title}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-xs">
                            {notif.message}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(notif.type)}>{notif.type}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{notif.sender.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{notif.recipientCount}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>
                              {notif.readCount} / {notif.recipientCount}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Bildirim Şablonları</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {templates.map((template) => (
                  <Card key={template.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <Badge className={`${getTypeColor(template.type)} mt-2`}>
                            {template.type}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <div className="text-sm font-medium">Başlık:</div>
                        <div className="text-sm text-muted-foreground">{template.title}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Mesaj:</div>
                        <div className="text-sm text-muted-foreground">{template.message}</div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUseTemplate(template)}
                        className="w-full mt-2"
                      >
                        Kullan
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Template Dialog */}
      <Dialog open={templateDialog} onOpenChange={setTemplateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Şablon Seç</DialogTitle>
            <DialogDescription>
              Kullanmak istediğiniz şablonu seçin
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 max-h-96 overflow-y-auto">
            {templates.map((template) => (
              <div
                key={template.id}
                className="border rounded-lg p-4 cursor-pointer hover:bg-muted"
                onClick={() => handleUseTemplate(template)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{template.name}</h3>
                  <Badge className={getTypeColor(template.type)}>{template.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{template.message}</p>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateDialog(false)}>
              İptal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
