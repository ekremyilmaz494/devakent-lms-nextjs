"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trainingInfoSchema, type TrainingInfoFormData } from "@/types/training";
import { useTrainingWizard } from "@/store/training-store";
import { format } from "date-fns";

interface Step1InfoProps {
  onValid?: () => void;
}

export function Step1Info({ onValid }: Step1InfoProps) {
  const { info, setInfo, markStepComplete } = useTrainingWizard();

  const form = useForm<TrainingInfoFormData>({
    resolver: zodResolver(trainingInfoSchema),
    defaultValues: {
      title: info.title || "",
      description: info.description || "",
      category: info.category || "",
      thumbnail: info.thumbnail || "",
      passingScore: info.passingScore || 70,
      maxAttempts: info.maxAttempts || 3,
      examDuration: info.examDuration || 30,
      startDate: info.startDate || new Date(),
      endDate: info.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün sonra
    },
  });

  const { watch, formState } = form;
  const isValid = formState.isValid;

  // Watch form changes and update store
  useEffect(() => {
    const subscription = watch((value) => {
      setInfo(value as Partial<TrainingInfoFormData>);
    });
    return () => subscription.unsubscribe();
  }, [watch, setInfo]);

  // Mark step as complete when valid
  useEffect(() => {
    if (isValid) {
      markStepComplete(0);
      onValid?.();
    }
  }, [isValid, markStepComplete, onValid]);

  return (
    <Form {...form}>
      <form className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Temel Bilgiler</CardTitle>
            <CardDescription>
              Eğitimin temel bilgilerini girin. Bu bilgiler personellere gösterilecektir.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Başlık */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Eğitim Başlığı</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Örn: İş Güvenliği Temel Eğitimi"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Eğitimin kısa ve açıklayıcı başlığı
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Açıklama */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Açıklama</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Bu eğitimde neler öğrenilecek? Eğitimin amacı nedir?"
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Eğitimin detaylı açıklaması (en az 20 karakter)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Kategori */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Kategori seçiniz" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="İş Güvenliği">İş Güvenliği</SelectItem>
                      <SelectItem value="Hijyen">Hijyen</SelectItem>
                      <SelectItem value="Teknik">Teknik</SelectItem>
                      <SelectItem value="Hasta Hakları">Hasta Hakları</SelectItem>
                      <SelectItem value="İletişim">İletişim</SelectItem>
                      <SelectItem value="Acil Durum">Acil Durum</SelectItem>
                      <SelectItem value="Diğer">Diğer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Eğitimin kategorisini seçiniz (opsiyonel)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Thumbnail URL */}
            <FormField
              control={form.control}
              name="thumbnail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kapak Görseli URL (Opsiyonel)</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Eğitim kartında görünecek kapak görseli
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tarih ve Süre</CardTitle>
            <CardDescription>
              Eğitimin başlangıç/bitiş tarihleri ve sınav süresini belirleyin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Başlangıç Tarihi */}
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Başlangıç Tarihi</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : new Date();
                          field.onChange(date);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Eğitimin başlayacağı tarih
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Bitiş Tarihi */}
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bitiş Tarihi</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : new Date();
                          field.onChange(date);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Eğitimin biteceği tarih
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sınav Ayarları</CardTitle>
            <CardDescription>
              Sınav için geçme puanı, deneme hakkı ve süre ayarları
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Geçme Puanı */}
              <FormField
                control={form.control}
                name="passingScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Geçme Puanı (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      0-100 arası
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Maksimum Deneme */}
              <FormField
                control={form.control}
                name="maxAttempts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maksimum Deneme</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormDescription>
                      1-10 arası
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sınav Süresi */}
              <FormField
                control={form.control}
                name="examDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sınav Süresi (dk)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={5}
                        max={180}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 5)}
                      />
                    </FormControl>
                    <FormDescription>
                      5-180 dakika
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
