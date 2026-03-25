import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma as db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const reportType = searchParams.get("type") || "overview";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const hospitalId = session.user.hospitalId;

    // Date filter
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    switch (reportType) {
      case "overview":
        return await getOverviewReport(hospitalId!);

      case "trainings":
        return await getTrainingsReport(hospitalId!, dateFilter);

      case "staff":
        return await getStaffReport(hospitalId!, dateFilter);

      case "departments":
        return await getDepartmentsReport(hospitalId!, dateFilter);

      case "categories":
        return await getCategoriesReport(hospitalId!, dateFilter);

      case "certificates":
        return await getCertificatesReport(hospitalId!, dateFilter);

      default:
        return NextResponse.json({ error: "Geçersiz rapor tipi" }, { status: 400 });
    }
  } catch (error) {
    console.error("Reports fetch error:", error);
    return NextResponse.json(
      { error: "Raporlar yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Genel bakış raporu
async function getOverviewReport(hospitalId: string) {
  const [
    totalTrainings,
    totalStaff,
    totalAssignments,
    completedAssignments,
    certificates,
  ] = await Promise.all([
    db.training.count({ where: { hospitalId } }),
    db.user.count({ where: { role: "STAFF", hospitalId } }),
    db.trainingAssignment.count({ where: { training: { hospitalId }, deletedAt: null } }),
    db.trainingAssignment.count({
      where: { training: { hospitalId }, status: "passed", deletedAt: null },
    }),
    db.certificate.count({ where: { user: { hospitalId } } }),
  ]);

  const completionRate = totalAssignments > 0
    ? Math.round((completedAssignments / totalAssignments) * 100)
    : 0;

  return NextResponse.json({
    overview: {
      totalTrainings,
      totalStaff,
      totalAssignments,
      completedAssignments,
      completionRate,
      totalCertificates: certificates,
    },
  });
}

// Eğitim raporu
async function getTrainingsReport(hospitalId: string, dateFilter: any) {
  const trainings = await db.training.findMany({
    where: { hospitalId },
    include: {
      _count: {
        select: {
          assignments: {
            where: {
              deletedAt: null,
              ...(Object.keys(dateFilter).length > 0 ? { assignedAt: dateFilter } : {}),
            },
          },
        },
      },
    },
  });

  const trainingsWithStats = await Promise.all(
    trainings.map(async (training) => {
      const [completed, passed, failed, avgScore] = await Promise.all([
        db.trainingAssignment.count({
          where: {
            trainingId: training.id,
            status: { in: ["passed", "failed"] },
            deletedAt: null,
            ...(Object.keys(dateFilter).length > 0 ? { completedAt: dateFilter } : {}),
          },
        }),
        db.trainingAssignment.count({
          where: {
            trainingId: training.id,
            status: "passed",
            deletedAt: null,
            ...(Object.keys(dateFilter).length > 0 ? { completedAt: dateFilter } : {}),
          },
        }),
        db.trainingAssignment.count({
          where: {
            trainingId: training.id,
            status: { in: ["failed", "locked"] },
            deletedAt: null,
            ...(Object.keys(dateFilter).length > 0 ? { completedAt: dateFilter } : {}),
          },
        }),
        db.examAttempt.aggregate({
          where: {
            trainingId: training.id,
            status: "COMPLETED",
          },
          _avg: { score: true },
        }),
      ]);

      const successRate = completed > 0 ? Math.round((passed / completed) * 100) : 0;

      return {
        id: training.id,
        title: training.title,
        category: training.category,
        totalAssignments: training._count.assignments,
        completed,
        passed,
        failed,
        successRate,
        averageScore: Math.round(avgScore._avg.score || 0),
        passingScore: training.passingScore,
      };
    })
  );

  return NextResponse.json({ trainings: trainingsWithStats });
}

// Personel raporu
async function getStaffReport(hospitalId: string, dateFilter: any) {
  const staff = await db.user.findMany({
    where: { role: "STAFF", hospitalId },
    select: {
      id: true,
      name: true,
      email: true,
      department: true,
      tcNo: true,
      title: true,
    },
  });

  const staffWithStats = await Promise.all(
    staff.map(async (person) => {
      const [total, completed, passed, failed, avgScore] = await Promise.all([
        db.trainingAssignment.count({
          where: {
            userId: person.id,
            deletedAt: null,
            ...(Object.keys(dateFilter).length > 0 ? { assignedAt: dateFilter } : {}),
          },
        }),
        db.trainingAssignment.count({
          where: {
            userId: person.id,
            status: { in: ["passed", "failed"] },
            deletedAt: null,
            ...(Object.keys(dateFilter).length > 0 ? { completedAt: dateFilter } : {}),
          },
        }),
        db.trainingAssignment.count({
          where: {
            userId: person.id,
            status: "passed",
            deletedAt: null,
            ...(Object.keys(dateFilter).length > 0 ? { completedAt: dateFilter } : {}),
          },
        }),
        db.trainingAssignment.count({
          where: {
            userId: person.id,
            status: { in: ["failed", "locked"] },
            deletedAt: null,
            ...(Object.keys(dateFilter).length > 0 ? { completedAt: dateFilter } : {}),
          },
        }),
        db.examAttempt.aggregate({
          where: { userId: person.id, status: "COMPLETED" },
          _avg: { score: true },
        }),
      ]);

      const successRate = completed > 0 ? Math.round((passed / completed) * 100) : 0;

      return {
        ...person,
        totalAssignments: total,
        completed,
        passed,
        failed,
        successRate,
        averageScore: Math.round(avgScore._avg.score || 0),
      };
    })
  );

  return NextResponse.json({ staff: staffWithStats });
}

// Departman raporu
async function getDepartmentsReport(hospitalId: string, dateFilter: any) {
  const staff = await db.user.findMany({
    where: { role: "STAFF", hospitalId, department: { not: null } },
    select: { id: true, department: true },
  });

  // Group by department
  const deptMap = new Map<string, string[]>();
  staff.forEach((s) => {
    if (!s.department) return;
    if (!deptMap.has(s.department)) {
      deptMap.set(s.department, []);
    }
    deptMap.get(s.department)!.push(s.id);
  });

  const departments = await Promise.all(
    Array.from(deptMap.entries()).map(async ([deptName, staffIds]) => {
      const [total, completed, passed] = await Promise.all([
        db.trainingAssignment.count({
          where: {
            userId: { in: staffIds },
            deletedAt: null,
            ...(Object.keys(dateFilter).length > 0 ? { assignedAt: dateFilter } : {}),
          },
        }),
        db.trainingAssignment.count({
          where: {
            userId: { in: staffIds },
            status: { in: ["passed", "failed"] },
            deletedAt: null,
            ...(Object.keys(dateFilter).length > 0 ? { completedAt: dateFilter } : {}),
          },
        }),
        db.trainingAssignment.count({
          where: {
            userId: { in: staffIds },
            status: "passed",
            deletedAt: null,
            ...(Object.keys(dateFilter).length > 0 ? { completedAt: dateFilter } : {}),
          },
        }),
      ]);

      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      const successRate = completed > 0 ? Math.round((passed / completed) * 100) : 0;

      return {
        department: deptName,
        staffCount: staffIds.length,
        totalAssignments: total,
        completed,
        passed,
        completionRate,
        successRate,
      };
    })
  );

  return NextResponse.json({ departments });
}

// Kategori raporu
async function getCategoriesReport(hospitalId: string, dateFilter: any) {
  const trainings = await db.training.findMany({
    where: { hospitalId, category: { not: null } },
    select: { id: true, category: true },
  });

  // Group by category
  const catMap = new Map<string, string[]>();
  trainings.forEach((t) => {
    if (!t.category) return;
    if (!catMap.has(t.category)) {
      catMap.set(t.category, []);
    }
    catMap.get(t.category)!.push(t.id);
  });

  const categories = await Promise.all(
    Array.from(catMap.entries()).map(async ([categoryName, trainingIds]) => {
      const [total, completed, passed, avgScore] = await Promise.all([
        db.trainingAssignment.count({
          where: {
            trainingId: { in: trainingIds },
            deletedAt: null,
            ...(Object.keys(dateFilter).length > 0 ? { assignedAt: dateFilter } : {}),
          },
        }),
        db.trainingAssignment.count({
          where: {
            trainingId: { in: trainingIds },
            status: { in: ["passed", "failed"] },
            deletedAt: null,
            ...(Object.keys(dateFilter).length > 0 ? { completedAt: dateFilter } : {}),
          },
        }),
        db.trainingAssignment.count({
          where: {
            trainingId: { in: trainingIds },
            status: "passed",
            deletedAt: null,
            ...(Object.keys(dateFilter).length > 0 ? { completedAt: dateFilter } : {}),
          },
        }),
        db.examAttempt.aggregate({
          where: {
            trainingId: { in: trainingIds },
            status: "COMPLETED",
          },
          _avg: { score: true },
        }),
      ]);

      const successRate = completed > 0 ? Math.round((passed / completed) * 100) : 0;

      return {
        category: categoryName,
        trainingCount: trainingIds.length,
        totalAssignments: total,
        completed,
        passed,
        successRate,
        averageScore: Math.round(avgScore._avg.score || 0),
      };
    })
  );

  return NextResponse.json({ categories });
}

// Sertifika raporu
async function getCertificatesReport(hospitalId: string, dateFilter: any) {
  const whereClause: any = {
    user: { hospitalId },
  };

  if (Object.keys(dateFilter).length > 0) {
    whereClause.createdAt = dateFilter;
  }

  const [total, pending, approved, rejected] = await Promise.all([
    db.certificate.count({ where: whereClause }),
    db.certificate.count({ where: { ...whereClause, status: "PENDING" } }),
    db.certificate.count({ where: { ...whereClause, status: "APPROVED" } }),
    db.certificate.count({ where: { ...whereClause, status: "REJECTED" } }),
  ]);

  const certificates = await db.certificate.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          department: true,
        },
      },
      training: {
        select: {
          id: true,
          title: true,
          category: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({
    summary: {
      total,
      pending,
      approved,
      rejected,
      approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0,
    },
    certificates: certificates.map((cert) => ({
      id: cert.id,
      certificateNo: cert.certificateNo,
      status: cert.status,
      createdAt: cert.createdAt,
      approvedAt: cert.approvedAt,
      userName: cert.user.name,
      userEmail: cert.user.email,
      userDepartment: cert.user.department,
      trainingTitle: cert.training.title,
      trainingCategory: cert.training.category,
    })),
  });
}
