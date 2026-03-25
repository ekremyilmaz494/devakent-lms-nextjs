import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Bildirim şablonları (hard-coded)
const NOTIFICATION_TEMPLATES = [
  {
    id: "welcome",
    name: "Hoş Geldin Mesajı",
    title: "Sisteme Hoş Geldiniz!",
    message:
      "Merhaba! {{name}}, eğitim platformumuza hoş geldiniz. Atanmış eğitimlerinizi görmek için giriş yapabilirsiniz.",
    type: "SUCCESS",
  },
  {
    id: "training_assigned",
    name: "Eğitim Atama Bildirimi",
    title: "Yeni Eğitim Atandı",
    message:
      "Merhaba {{name}}, size '{{trainingTitle}}' eğitimi atandı. Lütfen en kısa sürede eğitime başlayınız.",
    type: "INFO",
  },
  {
    id: "training_reminder",
    name: "Eğitim Hatırlatma",
    title: "Eğitim Hatırlatması",
    message:
      "Merhaba {{name}}, '{{trainingTitle}}' eğitiminizi henüz tamamlamadınız. Lütfen eğitiminize devam ediniz.",
    type: "WARNING",
  },
  {
    id: "certificate_ready",
    name: "Sertifika Hazır",
    title: "Sertifikanız Hazır!",
    message:
      "Tebrikler {{name}}! '{{trainingTitle}}' eğitimi için sertifikanız hazır. Sertifikanızı indirmek için profilinizi ziyaret edebilirsiniz.",
    type: "SUCCESS",
  },
  {
    id: "exam_failed",
    name: "Sınav Başarısız",
    title: "Sınav Sonucu",
    message:
      "Merhaba {{name}}, '{{trainingTitle}}' sınavından {{score}} puan aldınız ve başarısız oldunuz. Kalan deneme hakkınız: {{remainingAttempts}}",
    type: "ERROR",
  },
  {
    id: "exam_passed",
    name: "Sınav Başarılı",
    title: "Tebrikler!",
    message:
      "Tebrikler {{name}}! '{{trainingTitle}}' sınavından {{score}} puan aldınız ve başarıyla tamamladınız!",
    type: "SUCCESS",
  },
  {
    id: "attempt_granted",
    name: "Yeni Deneme Hakkı",
    title: "Yeni Deneme Hakkı Verildi",
    message:
      "Merhaba {{name}}, '{{trainingTitle}}' eğitimi için size yeni bir deneme hakkı tanınmıştır. Tekrar deneyebilirsiniz.",
    type: "INFO",
  },
];

// GET - Şablonları listele
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    return NextResponse.json({ templates: NOTIFICATION_TEMPLATES });
  } catch (error) {
    console.error("Templates fetch error:", error);
    return NextResponse.json(
      { error: "Şablonlar yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
