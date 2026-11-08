import type { Db } from "../db/database.ts";
import type { ApplicationDbo } from "../models/application.ts";

export type CreateApplicationResult =
  | { kind: "created"; application: ApplicationDbo }
  | { kind: "offer_not_found" }
  | { kind: "offer_not_published" }
  | { kind: "duplicate" };

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

  const create = db.transaction((params: ApplicationParams): CreateApplicationResult => {
    const offer = findOffer.get({ offerId: params.offerId });
    if (offer === undefined) return { kind: "offer_not_found" };
    if (offer.status !== "PUBLISHED") return { kind: "offer_not_published" };
    if (findActive.get(params) !== undefined) return { kind: "duplicate" };

    return { kind: "created", application: insert.get(params) as ApplicationDbo };
  });

  return { create };
};

export type ApplicationsRepository = ReturnType<typeof createApplicationsRepository>;
