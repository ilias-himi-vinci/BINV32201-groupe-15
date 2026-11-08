import { APPLICATION_STATUSES, type ApplicationStatus } from "./applicationStatus.ts";

export { APPLICATION_STATUSES };
export type { ApplicationStatus };

export interface Application {
  id: number;
  offerId: number;
  message: string | null;
  status: ApplicationStatus;
  appliedAt: string;
}

export interface ApplicationListItem extends Application {
  offerTitle: string;
  companyShortName: string;
  academicYear: string;
  period: "P1" | "P2" | "OTHER";
}
