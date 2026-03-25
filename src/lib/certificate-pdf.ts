import React from "react";
import { Document, Page, Text, View, StyleSheet, pdf, Font } from "@react-pdf/renderer";

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 60,
    backgroundColor: "#ffffff",
  },
  border: {
    border: "4px solid #2563eb",
    padding: 40,
    height: "100%",
  },
  header: {
    textAlign: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 5,
  },
  body: {
    marginTop: 40,
    marginBottom: 40,
    textAlign: "center",
  },
  bodyText: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 15,
    lineHeight: 1.6,
  },
  recipientName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0f172a",
    marginTop: 20,
    marginBottom: 20,
  },
  trainingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2563eb",
    marginBottom: 10,
  },
  dateSection: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateBox: {
    textAlign: "center",
  },
  dateLabel: {
    fontSize: 10,
    color: "#64748b",
    marginBottom: 5,
  },
  dateValue: {
    fontSize: 12,
    color: "#0f172a",
  },
  footer: {
    marginTop: "auto",
    paddingTop: 20,
    borderTop: "2px solid #e2e8f0",
    textAlign: "center",
  },
  certificateNo: {
    fontSize: 10,
    color: "#64748b",
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2563eb",
    marginBottom: 10,
  },
});

// Certificate Document Component
interface CertificateDocumentProps {
  recipientName: string;
  trainingTitle: string;
  certificateNo: string;
  completionDate: Date;
  hospitalName?: string;
}

const CertificateDocument: React.FC<CertificateDocumentProps> = ({
  recipientName,
  trainingTitle,
  certificateNo,
  completionDate,
  hospitalName = "Devakent LMS",
}) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.border}>
        <View style={styles.header}>
          <Text style={styles.logo}>🎓 {hospitalName}</Text>
          <Text style={styles.title}>SERTİFİKA</Text>
          <Text style={styles.subtitle}>Eğitim Tamamlama Belgesi</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.bodyText}>Bu sertifika</Text>
          <Text style={styles.recipientName}>{recipientName}</Text>
          <Text style={styles.bodyText}>tarafından</Text>
          <Text style={styles.trainingTitle}>{trainingTitle}</Text>
          <Text style={styles.bodyText}>
            eğitiminin başarıyla tamamlandığını onaylar.
          </Text>
        </View>

        <View style={styles.dateSection}>
          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>Tamamlanma Tarihi</Text>
            <Text style={styles.dateValue}>
              {completionDate.toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Text>
          </View>
          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>Düzenlenme Tarihi</Text>
            <Text style={styles.dateValue}>
              {new Date().toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.certificateNo}>
            Sertifika No: {certificateNo}
          </Text>
        </View>
      </View>
    </Page>
  </Document>
);

/**
 * Generate PDF certificate as a Buffer
 */
export async function generateCertificatePDF(data: CertificateDocumentProps): Promise<Buffer> {
  const doc = React.createElement(CertificateDocument, data);
  const asPdf = pdf(doc);
  const blob = await asPdf.toBlob();
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Generate certificate and upload to S3 (mock mode supported)
 */
export async function generateAndUploadCertificate(data: {
  recipientName: string;
  trainingTitle: string;
  certificateNo: string;
  completionDate: Date;
  hospitalName?: string;
}): Promise<{ url: string; key: string }> {
  const USE_MOCK_S3 = process.env.USE_MOCK_S3 === "true";

  if (USE_MOCK_S3) {
    // Mock mode - return a placeholder URL
    console.log("📄 [MOCK] Certificate PDF generation simulated");
    return {
      url: `https://mock-cdn.cloudfront.net/certificates/${data.certificateNo}.pdf`,
      key: `certificates/${data.certificateNo}.pdf`,
    };
  }

  // Real implementation
  const pdfBuffer = await generateCertificatePDF(data);

  // Upload to S3
  // const { uploadToS3 } = await import("./s3");
  // const result = await uploadToS3({
  //   buffer: pdfBuffer,
  //   key: `certificates/${data.certificateNo}.pdf`,
  //   contentType: "application/pdf",
  // });

  // return {
  //   url: result.url,
  //   key: result.key,
  // };

  // Placeholder for now
  return {
    url: `https://example.com/certificates/${data.certificateNo}.pdf`,
    key: `certificates/${data.certificateNo}.pdf`,
  };
}
