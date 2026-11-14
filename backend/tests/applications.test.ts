import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { APPLICATION, OFFER, STUDENT } from "../src/db/seed/seedIds.ts";
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

  it.each([
    ["un corps vide", undefined, "INVALID_BODY"],
    ["un identifiant de candidature textuel", { offerId: "1" }, "INVALID_OFFER_ID"],
    ["un identifiant négatif", { offerId: -1 }, "INVALID_OFFER_ID"],
    ["un message non textuel", { offerId: OFFER.DATA_QUALITY, message: 42 }, "INVALID_MESSAGE"],
  ])("refuse %s avant la création de candidature (400)", async (_case, body, code) => {
    const response = await request(app)
      .post("/applications")
      .set("Authorization", tokenFor("STUDENT", STUDENT.MATEUSZ_KOWALSKI))
      .send(body);

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe(code);
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

describe("GET /applications", () => {
  it("retourne uniquement les candidatures de l'étudiant, de la plus récente à la plus ancienne", async () => {
    const response = await request(app)
      .get("/applications")
      .set("Authorization", tokenFor("STUDENT", STUDENT.MATEUSZ_KOWALSKI));

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      expect.objectContaining({
        id: 3,
        offerId: OFFER.CLOUD_MIGRATION,
        offerTitle: "Migration d'une application vers le cloud",
        status: "SELECTED",
        academicYear: "2026-2027",
      }),
    ]);
  });

  it("refuse la consultation aux profils non étudiants", async () => {
    const response = await request(app)
      .get("/applications")
      .set("Authorization", tokenFor("ADMIN", 1));

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });
});

describe("PATCH /applications/:id/withdraw", () => {
  it("retire une candidature en cours sans la supprimer", async () => {
    const response = await request(app)
      .patch(`/applications/${APPLICATION.LUCAS_FLEET_APP}/withdraw`)
      .set("Authorization", tokenFor("STUDENT", STUDENT.LUCAS_DUPONT));

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: APPLICATION.LUCAS_FLEET_APP,
      status: "WITHDRAWN",
    });
    expect(
      db.prepare("SELECT status FROM applications WHERE id = ?").get(APPLICATION.LUCAS_FLEET_APP),
    ).toEqual({ status: "WITHDRAWN" });
  });

  it("refuse le retrait par un autre étudiant", async () => {
    const response = await request(app)
      .patch(`/applications/${APPLICATION.LUCAS_FLEET_APP}/withdraw`)
      .set("Authorization", tokenFor("STUDENT", STUDENT.MATEUSZ_KOWALSKI));

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it.each(["0", "-1", "abc"])("refuse un identifiant de candidature invalide (%s) (400)", async (id) => {
    const response = await request(app)
      .patch(`/applications/${id}/withdraw`)
      .set("Authorization", tokenFor("STUDENT", STUDENT.LUCAS_DUPONT));

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_APPLICATION_ID");
  });

  it("retourne 404 pour une candidature inconnue", async () => {
    const response = await request(app)
      .patch("/applications/999/withdraw")
      .set("Authorization", tokenFor("STUDENT", STUDENT.LUCAS_DUPONT));

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("APPLICATION_NOT_FOUND");
  });

  it.each([
    ["SELECTED", APPLICATION.MATEUSZ_CLOUD_MIGRATION, STUDENT.MATEUSZ_KOWALSKI],
    ["REJECTED", 4, STUDENT.LEA_MERTENS],
    ["WITHDRAWN", APPLICATION.INES_BILLING_API, STUDENT.INES_HADDAD],
  ])("refuse une candidature %s", async (_status, applicationId, studentId) => {
    const response = await request(app)
      .patch(`/applications/${applicationId}/withdraw`)
      .set("Authorization", tokenFor("STUDENT", studentId));

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("APPLICATION_NOT_WITHDRAWABLE");
  });

  it("permet une nouvelle candidature après le retrait", async () => {
    await request(app)
      .patch(`/applications/${APPLICATION.LUCAS_FLEET_APP}/withdraw`)
      .set("Authorization", tokenFor("STUDENT", STUDENT.LUCAS_DUPONT));

    const response = await applyAs(STUDENT.LUCAS_DUPONT, { offerId: OFFER.FLEET_APP });

    expect(response.status).toBe(201);
    expect(response.body.id).not.toBe(APPLICATION.LUCAS_FLEET_APP);
  });
});
