import { Router } from "express";
import { toOfferDto } from "../mappers/offer.mapper.ts";
import { getCurrentUser } from "../middlewares/authenticate.ts";
import { authorize } from "../middlewares/authorize.ts";
import type { OffersService } from "../services/offers.service.ts";
import { canListOffers } from "../services/permissions.ts";
import { HttpError } from "../utils/httpError.ts";
import type { PeriodCode } from "../models/offer.ts";

const PERIOD_CODES: readonly PeriodCode[] = ["P1", "P2", "OTHER"];

const readPeriod = (value: unknown): PeriodCode | undefined => {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !PERIOD_CODES.includes(value as PeriodCode)) {
    throw new HttpError(400, "INVALID_QUERY", "Le paramètre period est invalide");
  }
  return value as PeriodCode;
};

export const createOffersRouter = (offersService: OffersService) => {
  const router = Router();

  router.get("/", authorize(canListOffers), (req, res) => {
    res.json(offersService.listOffers(getCurrentUser(req), readPeriod(req.query.period)).map(toOfferDto));
  });

  return router;
};
