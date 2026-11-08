import type { Application, ApplicationDbo, ApplicationListItem } from "../models/application.ts";

export const toApplication = (row: ApplicationDbo): Application => ({
  id: row.id,
  offerId: row.offer_id,
  message: row.message,
  status: row.status,
  appliedAt: row.applied_at,
});

export const toApplicationDto = (application: Application) => application;

export const toApplicationListItem = (row: ApplicationListItem): ApplicationListItem => row;
