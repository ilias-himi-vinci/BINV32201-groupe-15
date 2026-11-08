import { toApplication } from "../mappers/application.mapper.ts";
import type { Application } from "../models/application.ts";
import type { ApplicationsRepository } from "../repositories/applications.repository.ts";
import type { User } from "../models/user.ts";
import { isStudent } from "./permissions.ts";
import { HttpError } from "../utils/httpError.ts";

export const createApplicationsService = (repository: ApplicationsRepository) => ({
  createApplication: (viewer: User, offerId: number, message: string | null): Application => {
    if (!isStudent(viewer)) {
      throw new HttpError(403, "FORBIDDEN", "Seul un étudiant peut candidater");
    }

    const result = repository.create({ offerId, studentId: viewer.id, message });
    if (result.kind === "offer_not_found") {
      throw new HttpError(404, "OFFER_NOT_FOUND", "Cette offre n'existe pas");
    }
    if (result.kind === "offer_not_published") {
      throw new HttpError(400, "OFFER_NOT_PUBLISHED", "Cette offre n'est pas publiée");
    }
    if (result.kind === "duplicate") {
      throw new HttpError(409, "APPLICATION_EXISTS", "Vous avez déjà candidaté à cette offre");
    }
    return toApplication(result.application);
  },
});

export type ApplicationsService = ReturnType<typeof createApplicationsService>;
