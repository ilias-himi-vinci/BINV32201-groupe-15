import type { Db } from "../db/database.ts";
import type { ApplicationDbo } from "../models/application.ts";
import type { ApplicationListItem } from "../models/application.ts";

export type CreateApplicationResult =
  | { kind: "created"; application: ApplicationDbo }
  | { kind: "offer_not_found" }
  | { kind: "offer_not_published" }
  | { kind: "duplicate" };

export type WithdrawApplicationResult =
  | { kind: "withdrawn"; application: ApplicationDbo }
  | { kind: "not_found" }
  | { kind: "forbidden" }
  | { kind: "not_in_progress" };

interface ApplicationParams {
  offerId: number;
  studentId: number;
  message: string | null;
}

export const createApplicationsRepository = (db: Db) => {
  const findOffer = db.prepare<{ offerId: number }, { status: string }>(
    "SELECT status FROM offers WHERE id = @offerId",
  );
  const findActive = db.prepare<{ offerId: number; studentId: number }, { id: number }>(
    "SELECT id FROM applications WHERE offer_id = @offerId AND student_id = @studentId AND status = 'IN_PROGRESS'",
  );
  const insert = db.prepare<ApplicationParams, ApplicationDbo>(`
    INSERT INTO applications (offer_id, student_id, message)
    VALUES (@offerId, @studentId, @message)
    RETURNING id, offer_id, student_id, message, status, applied_at
  `);
  const findByStudent = db.prepare<{ studentId: number }, ApplicationListItem>(`
    SELECT a.id, a.offer_id AS offerId, a.message, a.status,
           a.applied_at AS appliedAt, o.title AS offerTitle, c.short_name AS companyShortName,
           ay.label AS academicYear, p.code AS period
    FROM applications a
    JOIN offers o ON o.id = a.offer_id
    JOIN companies c ON c.id = o.company_id
    JOIN academic_years ay ON ay.id = o.academic_year_id
    JOIN periods p ON p.id = o.period_id
    WHERE a.student_id = @studentId
    ORDER BY datetime(a.applied_at) DESC, a.id DESC
  `);
  const findById = db.prepare<{ id: number }, { student_id: number; status: string }>(
    "SELECT student_id, status FROM applications WHERE id = @id",
  );
  const withdraw = db.prepare<{ id: number }, ApplicationDbo>(`
    UPDATE applications
    SET status = 'WITHDRAWN'
    WHERE id = @id
    RETURNING id, offer_id, student_id, message, status, applied_at
  `);

  const create = db.transaction((params: ApplicationParams): CreateApplicationResult => {
    const offer = findOffer.get({ offerId: params.offerId });
    if (offer === undefined) return { kind: "offer_not_found" };
    if (offer.status !== "PUBLISHED") return { kind: "offer_not_published" };
    if (findActive.get(params) !== undefined) return { kind: "duplicate" };

    return { kind: "created", application: insert.get(params) as ApplicationDbo };
  });
  const withdrawApplication = db.transaction(
    (id: number, studentId: number): WithdrawApplicationResult => {
      const application = findById.get({ id });
      if (application === undefined) return { kind: "not_found" };
      if (application.student_id !== studentId) return { kind: "forbidden" };
      if (application.status !== "IN_PROGRESS") return { kind: "not_in_progress" };
      return { kind: "withdrawn", application: withdraw.get({ id }) as ApplicationDbo };
    },
  );

  return {
    create,
    withdraw: withdrawApplication,
    findByStudent: (studentId: number): ApplicationListItem[] => findByStudent.all({ studentId }),
  };
};

export type ApplicationsRepository = ReturnType<typeof createApplicationsRepository>;
