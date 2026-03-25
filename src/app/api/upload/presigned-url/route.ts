import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generatePresignedUploadUrl, generateS3Key, validateVideoFile } from "@/lib/s3";

// POST /api/upload/presigned-url - Generate presigned URL for video upload
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const body = await request.json();
    const { fileName, fileType, fileSize, trainingId } = body;

    // Validation
    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: "Dosya adı ve tipi gereklidir" },
        { status: 400 }
      );
    }

    // Validate file type and size
    const mockFile = {
      name: fileName,
      type: fileType,
      size: fileSize || 0,
    } as File;

    // Note: We can't fully validate without the actual file, but we can check type
    const allowedTypes = [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/mov",
      "video/quicktime",
      "video/x-msvideo", // .avi
      "video/x-matroska", // .mkv
    ];

    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        {
          error: `Desteklenmeyen video formatı. İzin verilenler: MP4, WebM, OGG, MOV`,
        },
        { status: 400 }
      );
    }

    // Check file size (max 500MB)
    const maxSizeBytes = 500 * 1024 * 1024;
    if (fileSize && fileSize > maxSizeBytes) {
      return NextResponse.json(
        { error: "Dosya çok büyük. Maksimum: 500MB" },
        { status: 400 }
      );
    }

    // Generate S3 key
    const key = generateS3Key({
      hospitalId: session.user.hospitalId || "no-hospital",
      trainingId,
      fileName,
      prefix: "training-videos",
    });

    // Generate presigned URL
    const result = await generatePresignedUploadUrl({
      key,
      contentType: fileType,
      expiresIn: 3600, // 1 hour
    });

    return NextResponse.json({
      uploadUrl: result.url,
      videoKey: result.key,
      videoUrl: result.publicUrl,
      bucket: result.bucket,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json(
      { error: "Presigned URL oluşturulamadı" },
      { status: 500 }
    );
  }
}
