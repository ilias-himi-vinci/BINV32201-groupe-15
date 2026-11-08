import { Router } from "express";
import { toApplicationDto } from "../mappers/application.mapper.ts";
import { getCurrentUser } from "../middlewares/authenticate.ts";
import type { ApplicationsService } from "../services/applications.service.ts";
import { HttpError } from "../utils/httpError.ts";

const readBody = (body: unknown): { offerId: number; message: string | null } => {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new HttpError(400, "INVALID_BODY", "Le corps de la requête est invalide");
  }
  const value = body as Record<string, unknown>;
  if (
    typeof value.offerId !== "number" ||
    !Number.isSafeInteger(value.offerId) ||
    value.offerId <= 0
  ) {
    throw new HttpError(400, "INVALID_OFFER_ID", "L'identifiant de l'offre est invalide");
  }
  if (value.message === undefined || value.message === null || value.message === "") {
    return { offerId: value.offerId, message: null };
  }
  if (typeof value.message !== "string" || value.message.length > 500) {
    throw new HttpError(400, "INVALID_MESSAGE", "Le message doit contenir au maximum 500 caractères");
  }
  return { offerId: value.offerId, message: value.message };
};

const readApplicationId = (value: string): number => {
  const applicationId = Number(value);
  if (!Number.isSafeInteger(applicationId) || applicationId <= 0) {
    throw new HttpError(400, "INVALID_APPLICATION_ID", "L'identifiant de la candidature est invalide");
  }
  return applicationId;
};

export const createApplicationsRouter = (applicationsService: ApplicationsService) => {
  const router = Router();

  router.get("/", (req, res) => {
    res.json(applicationsService.listApplications(getCurrentUser(req)));
  });

  router.post("/", (req, res) => {
    const { offerId, message } = readBody(req.body);
    res.status(201).json(
      toApplicationDto(applicationsService.createApplication(getCurrentUser(req), offerId, message)),
    );
  });

  router.patch("/:id/withdraw", (req, res) => {
    const application = applicationsService.withdrawApplication(
      getCurrentUser(req),
      readApplicationId(req.params.id),
    );
    res.json(toApplicationDto(application));
  });

  return router;
};
