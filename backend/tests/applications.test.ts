import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { OFFER, STUDENT } from "../src/db/seed/seedIds.ts";
import { createTestDatabase } from "./helpers/testDatabase.ts";
import { createTestApp, tokenFor } from "./helpers/testApp.ts";

let app: ReturnType<typeof createTestApp>;
let db: ReturnType<typeof createTestDatabase>;

beforeEach(() => {
  db = createTestDatabase();
  app = createTestApp(db);
});

const applyAs = (studentId: number, body: object) =>
  request(app)
    .post("/applications")
    .set("Authorization", tokenFor("STUDENT", studentId))
    .send(body);

describe("POST /applications", () => {
  it("crée une candidature avec un message", async () => {
    const response = await applyAs(STUDENT.MATEUSZ_KOWALSKI, {
      offerId: OFFER.FLEET_APP,
      message: "Mon expérience correspond à cette offre.",
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      offerId: OFFER.FLEET_APP,
      message: "Mon expérience correspond à cette offre.",
      status: "IN_PROGRESS",
    });
    expect(response.body).not.toHaveProperty("studentId");
  });

  it("normalise un message vide comme absent", async () => {
    const response = await applyAs(STUDENT.MATEUSZ_KOWALSKI, {
      offerId: OFFER.DATA_QUALITY,
      message: "",
    });

    expect(response.status).toBe(201);
    expect(response.body.message).toBeNull();
  });

  it("refuse les requêtes non authentifiées et les profils non étudiants", async () => {
    expect((await request(app).post("/applications").send({ offerId: OFFER.DATA_QUALITY })).status)
      .toBe(401);
    const response = await request(app)
      .post("/applications")
      .set("Authorization", tokenFor("ADMIN", 1))
      .send({ offerId: OFFER.DATA_QUALITY });
    expect(response.status).toBe(403);
  });

  it("refuse une offre inconnue ou non publiée", async () => {
    expect((await applyAs(STUDENT.MATEUSZ_KOWALSKI, { offerId: 999 })).status).toBe(404);
    expect((await applyAs(STUDENT.MATEUSZ_KOWALSKI, { offerId: OFFER.CLOUD_MIGRATION })).status)
      .toBe(400);
  });

  it("refuse un message de plus de 500 caractères", async () => {
    const response = await applyAs(STUDENT.MATEUSZ_KOWALSKI, {
      offerId: OFFER.DATA_QUALITY,
      message: "x".repeat(501),
    });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_MESSAGE");
  });

  it("refuse un doublon actif", async () => {
    const response = await applyAs(STUDENT.MATEUSZ_KOWALSKI, { offerId: OFFER.FLEET_APP });
    expect(response.status).toBe(201);
    const duplicate = await applyAs(STUDENT.MATEUSZ_KOWALSKI, { offerId: OFFER.FLEET_APP });
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error.code).toBe("APPLICATION_EXISTS");
  });

  it("autorise une nouvelle candidature après retrait de l'ancienne", async () => {
    const first = await applyAs(STUDENT.MATEUSZ_KOWALSKI, { offerId: OFFER.FLEET_APP });
    expect(first.status).toBe(201);
    db.prepare("UPDATE applications SET status = 'WITHDRAWN' WHERE id = ?").run(first.body.id);
    const second = await applyAs(STUDENT.MATEUSZ_KOWALSKI, { offerId: OFFER.FLEET_APP });
    expect(second.status).toBe(201);
    expect(second.body.id).not.toBe(first.body.id);
  });
});
