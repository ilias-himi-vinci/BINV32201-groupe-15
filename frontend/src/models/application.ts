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
