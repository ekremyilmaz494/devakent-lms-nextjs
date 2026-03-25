import { Resend } from "resend";

// Resend API Key (çevre değişkeninden)
const resend = new Resend(process.env.RESEND_API_KEY);

// Email gönderimi için temel tip
interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

// Mock mode - development için
const USE_MOCK_EMAIL = process.env.USE_MOCK_EMAIL === "true" || !process.env.RESEND_API_KEY;

/**
 * Email gönderir (production'da Resend kullanır, development'ta console'a yazdırır)
 */
export async function sendEmail(options: SendEmailOptions) {
  const from = options.from || process.env.EMAIL_FROM || "noreply@devakent-lms.com";

  if (USE_MOCK_EMAIL) {
    console.log("📧 [MOCK EMAIL] Email gönderimi simüle ediliyor:");
    console.log("  From:", from);
    console.log("  To:", options.to);
    console.log("  Subject:", options.subject);
    console.log("  HTML:", options.html.substring(0, 200) + "...");

    return {
      success: true,
      mock: true,
      messageId: `mock-${Date.now()}`,
    };
  }

  try {
    const result = await resend.emails.send({
      from,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
    });

    return {
      success: true,
      messageId: result.data?.id,
    };
  } catch (error) {
    console.error("❌ Email gönderme hatası:", error);
    throw error;
  }
}

// =============================================================================
// EMAIL TEMPLATE'LERİ
// =============================================================================

/**
 * Eğitim atama bildirimi
 */
export async function sendTrainingAssignmentEmail(data: {
  recipientEmail: string;
  recipientName: string;
  trainingTitle: string;
  trainingDescription?: string;
  dueDate?: Date;
  loginUrl: string;
}) {
  const dueDateStr = data.dueDate
    ? new Date(data.dueDate).toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: #2563eb; color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .info-box { background: #f0f9ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 Yeni Eğitim Ataması</h1>
    </div>
    <div class="content">
      <p>Merhaba <strong>${data.recipientName}</strong>,</p>

      <p>Size yeni bir eğitim atandı:</p>

      <div class="info-box">
        <h3 style="margin-top: 0;">${data.trainingTitle}</h3>
        ${data.trainingDescription ? `<p>${data.trainingDescription}</p>` : ""}
        ${dueDateStr ? `<p><strong>Bitiş Tarihi:</strong> ${dueDateStr}</p>` : ""}
      </div>

      <p>Eğitime başlamak için aşağıdaki butona tıklayarak sisteme giriş yapabilirsiniz:</p>

      <center>
        <a href="${data.loginUrl}" class="button">Eğitime Başla</a>
      </center>

      <p>Eğitimi tamamlamayı unutmayın!</p>

      <p>İyi çalışmalar,<br>Devakent LMS Ekibi</p>
    </div>
    <div class="footer">
      <p>Bu email otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.</p>
      <p>&copy; ${new Date().getFullYear()} Devakent LMS. Tüm hakları saklıdır.</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: data.recipientEmail,
    subject: `Yeni Eğitim Ataması: ${data.trainingTitle}`,
    html,
  });
}

/**
 * Sınav sonucu bildirimi
 */
export async function sendExamResultEmail(data: {
  recipientEmail: string;
  recipientName: string;
  trainingTitle: string;
  score: number;
  passingScore: number;
  isPassed: boolean;
  remainingAttempts?: number;
  certificateUrl?: string;
}) {
  const statusColor = data.isPassed ? "#10b981" : "#ef4444";
  const statusText = data.isPassed ? "Başarılı ✓" : "Başarısız ✗";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: ${statusColor}; color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .score-box { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
    .score { font-size: 48px; font-weight: bold; color: ${statusColor}; margin: 10px 0; }
    .button { display: inline-block; background: ${statusColor}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Sınav Sonucu</h1>
    </div>
    <div class="content">
      <p>Merhaba <strong>${data.recipientName}</strong>,</p>

      <p><strong>${data.trainingTitle}</strong> eğitimi sınav sonucunuz:</p>

      <div class="score-box">
        <div class="score">${data.score}%</div>
        <p style="font-size: 18px; color: ${statusColor}; font-weight: bold; margin: 10px 0;">
          ${statusText}
        </p>
        <p style="color: #666; margin: 5px 0;">Geçme Puanı: ${data.passingScore}%</p>
      </div>

      ${
        data.isPassed
          ? `
        <p style="color: #10b981; font-weight: bold;">🎉 Tebrikler! Sınavı başarıyla tamamladınız.</p>
        ${
          data.certificateUrl
            ? `
        <center>
          <a href="${data.certificateUrl}" class="button">Sertifikamı Görüntüle</a>
        </center>
        `
            : "<p>Sertifikanız admin onayından sonra hazır olacaktır.</p>"
        }
      `
          : `
        <p style="color: #ef4444; font-weight: bold;">⚠️ Maalesef sınavı geçemediniz.</p>
        ${
          data.remainingAttempts && data.remainingAttempts > 0
            ? `<p>Kalan deneme hakkınız: <strong>${data.remainingAttempts}</strong></p>
               <p>Videoları tekrar izleyip sınava tekrar girebilirsiniz.</p>`
            : "<p>Deneme hakkınız dolmuştur. Yöneticinizle iletişime geçin.</p>"
        }
      `
      }

      <p>İyi çalışmalar,<br>Devakent LMS Ekibi</p>
    </div>
    <div class="footer">
      <p>Bu email otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.</p>
      <p>&copy; ${new Date().getFullYear()} Devakent LMS. Tüm hakları saklıdır.</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: data.recipientEmail,
    subject: `Sınav Sonucu: ${data.trainingTitle} - ${data.isPassed ? "Başarılı" : "Başarısız"}`,
    html,
  });
}

/**
 * Sertifika onayı bildirimi
 */
export async function sendCertificateApprovedEmail(data: {
  recipientEmail: string;
  recipientName: string;
  trainingTitle: string;
  certificateNo: string;
  certificateUrl: string;
}) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .certificate-box { background: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏆 Sertifikanız Onaylandı!</h1>
    </div>
    <div class="content">
      <p>Merhaba <strong>${data.recipientName}</strong>,</p>

      <p><strong>${data.trainingTitle}</strong> eğitimi için sertifikanız onaylandı!</p>

      <div class="certificate-box">
        <p style="font-size: 18px; font-weight: bold; color: #667eea; margin: 10px 0;">
          Sertifika No: ${data.certificateNo}
        </p>
        <p style="color: #666;">Sertifikanızı indirmek için aşağıdaki butona tıklayın:</p>
      </div>

      <center>
        <a href="${data.certificateUrl}" class="button">Sertifikayı İndir</a>
      </center>

      <p>🎉 Tebrikler! Eğitimi başarıyla tamamladığınız için sertifikanız hazır.</p>

      <p>İyi çalışmalar,<br>Devakent LMS Ekibi</p>
    </div>
    <div class="footer">
      <p>Bu email otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.</p>
      <p>&copy; ${new Date().getFullYear()} Devakent LMS. Tüm hakları saklıdır.</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: data.recipientEmail,
    subject: `Sertifikanız Hazır: ${data.trainingTitle}`,
    html,
  });
}

/**
 * Eğitim hatırlatma maili
 */
export async function sendTrainingReminderEmail(data: {
  recipientEmail: string;
  recipientName: string;
  trainingTitle: string;
  dueDate: Date;
  dashboardUrl: string;
}) {
  const dueDateStr = new Date(data.dueDate).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const daysRemaining = Math.ceil(
    (data.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: #f59e0b; color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .warning-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
    .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Eğitim Hatırlatma</h1>
    </div>
    <div class="content">
      <p>Merhaba <strong>${data.recipientName}</strong>,</p>

      <p>Size atanan <strong>${data.trainingTitle}</strong> eğitimini henüz tamamlamadınız.</p>

      <div class="warning-box">
        <p style="margin: 0;"><strong>Bitiş Tarihi:</strong> ${dueDateStr}</p>
        <p style="margin: 10px 0 0 0; color: #92400e;">
          ${daysRemaining > 0 ? `Kalan süre: ${daysRemaining} gün` : "⚠️ Bitiş tarihi geçti!"}
        </p>
      </div>

      <p>Lütfen eğitimi zamanında tamamlamayı unutmayın.</p>

      <center>
        <a href="${data.dashboardUrl}" class="button">Eğitime Git</a>
      </center>

      <p>İyi çalışmalar,<br>Devakent LMS Ekibi</p>
    </div>
    <div class="footer">
      <p>Bu email otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.</p>
      <p>&copy; ${new Date().getFullYear()} Devakent LMS. Tüm hakları saklıdır.</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: data.recipientEmail,
    subject: `Eğitim Hatırlatma: ${data.trainingTitle}`,
    html,
  });
}
