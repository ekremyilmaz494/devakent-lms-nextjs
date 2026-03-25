"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Bell, Moon, Sun, Globe } from "lucide-react";

export default function StaffSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("tr");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Ayarlar</h1>
        <p className="text-sm text-muted-foreground">Bildirim tercihleri ve hesap ayarları.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />Bildirim Tercihleri
            </CardTitle>
            <CardDescription>Hangi bildirimleri almak istediğinizi seçin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>E-posta Bildirimleri</Label>
                <p className="text-sm text-muted-foreground">Yeni eğitim atamaları için e-posta alın</p>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${emailNotifications ? "bg-primary" : "bg-gray-300"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${emailNotifications ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Bildirimleri</Label>
                <p className="text-sm text-muted-foreground">Tarayıcı bildirimleri göster</p>
              </div>
              <button
                onClick={() => setPushNotifications(!pushNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${pushNotifications ? "bg-primary" : "bg-gray-300"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${pushNotifications ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              Tema Tercihi
            </CardTitle>
            <CardDescription>Aydınlık veya karanlık tema seçin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button variant={theme === "light" ? "default" : "outline"} onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" />Aydınlık
              </Button>
              <Button variant={theme === "dark" ? "default" : "outline"} onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" />Karanlık
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />Dil Seçimi
            </CardTitle>
            <CardDescription>Uygulama dilini seçin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button variant={language === "tr" ? "default" : "outline"} onClick={() => setLanguage("tr")}>
                Türkçe
              </Button>
              <Button variant={language === "en" ? "default" : "outline"} onClick={() => setLanguage("en")} disabled>
                English (Yakında)
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button>Ayarları Kaydet</Button>
        </div>
      </div>
    </div>
  );
}
