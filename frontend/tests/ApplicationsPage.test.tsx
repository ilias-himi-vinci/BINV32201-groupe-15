import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ApplicationsPage from "../src/pages/ApplicationsPage.tsx";
import { stubFetch } from "./helpers/fetchMock.ts";

const applications = [
  {
    id: 2,
    offerId: 5,
    offerTitle: "Tableau de bord qualité",
    companyShortName: "Lumen Data",
    academicYear: "2026-2027",
    period: "OTHER",
    message: null,
    status: "SELECTED",
    appliedAt: "2026-11-08 16:00:00",
  },
  {
    id: 4,
    offerId: 7,
    offerTitle: "Assistant conversationnel interne",
    companyShortName: "Brikk",
    academicYear: "2026-2027",
    period: "P2",
    message: null,
    status: "IN_PROGRESS",
    appliedAt: "2026-11-01 10:00:00",
  },
  {
    id: 1,
    offerId: 1,
    offerTitle: "Gestion de flotte",
    companyShortName: "Lumen Digital",
    academicYear: "2025-2026",
    period: "P1",
    message: null,
    status: "WITHDRAWN",
    appliedAt: "2025-10-01 10:00:00",
  },
  {
    id: 3,
    offerId: 2,
    offerTitle: "Portail client",
    companyShortName: "Lumen Digital",
    academicYear: "2025-2026",
    period: "P2",
    message: null,
    status: "REJECTED",
    appliedAt: "2025-09-01 10:00:00",
  },
];

describe("ApplicationsPage", () => {
  it("affiche tout l'historique dans l'ordre reçu avec les libellés de statut", async () => {
    stubFetch({ "/api/applications": () => Response.json(applications) });

    render(<ApplicationsPage token="jeton" onUnauthorized={vi.fn()} />);

    expect(await screen.findByText("Tableau de bord qualité")).toBeInTheDocument();
    expect(screen.getByText("Retenue")).toBeInTheDocument();
    expect(screen.getByText("En cours")).toBeInTheDocument();
    expect(screen.getByText("Non retenue")).toBeInTheDocument();
    expect(screen.getByText("Retirée")).toBeInTheDocument();
    expect(screen.getAllByText("2025-2026")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Retirer" })).toBeInTheDocument();
  });

  it("affiche l'état vide", async () => {
    stubFetch({ "/api/applications": () => Response.json([]) });

    render(<ApplicationsPage token="jeton" onUnauthorized={vi.fn()} />);

    expect(await screen.findByText("Aucune candidature à afficher.")).toBeInTheDocument();
  });

  it("signale une session expirée", async () => {
    const onUnauthorized = vi.fn();
    stubFetch({ "/api/applications": () => new Response(null, { status: 401 }) });

    render(<ApplicationsPage token="jeton" onUnauthorized={onUnauthorized} />);

    await waitFor(() => expect(onUnauthorized).toHaveBeenCalled());
  });

  it("affiche une erreur si le retrait est refusé au niveau métier", async () => {
    const confirm = vi.fn(() => true);
    vi.stubGlobal("confirm", confirm);
    stubFetch({
      "/api/applications": () => Response.json(applications),
      "/api/applications/4/withdraw": () => new Response(null, { status: 409 }),
    });

    render(<ApplicationsPage token="jeton" onUnauthorized={vi.fn()} />);

    await screen.findByText("Assistant conversationnel interne");
    screen.getByRole("button", { name: "Retirer" }).click();

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("statut 409"));
  });

  it("signale une session expirée lors du retrait d'une candidature", async () => {
    const confirm = vi.fn(() => true);
    vi.stubGlobal("confirm", confirm);
    const onUnauthorized = vi.fn();
    stubFetch({
      "/api/applications": () => Response.json(applications),
      "/api/applications/4/withdraw": () => new Response(null, { status: 401 }),
    });

    render(<ApplicationsPage token="jeton" onUnauthorized={onUnauthorized} />);

    await screen.findByText("Assistant conversationnel interne");
    screen.getByRole("button", { name: "Retirer" }).click();

    await waitFor(() => expect(onUnauthorized).toHaveBeenCalled());
  });

  it("demande confirmation puis retire une candidature en cours", async () => {
    const confirm = vi.fn(() => true);
    vi.stubGlobal("confirm", confirm);
    stubFetch({
      "/api/applications": () => Response.json(applications),
      "/api/applications/4/withdraw": () =>
        Response.json({ ...applications[1], status: "WITHDRAWN" }),
    });

    render(<ApplicationsPage token="jeton" onUnauthorized={vi.fn()} />);

    await screen.findByText("Assistant conversationnel interne");
    screen.getByRole("button", { name: "Retirer" }).click();

    expect(confirm).toHaveBeenCalledWith("Retirer cette candidature ?");
    await waitFor(() => expect(screen.getByText("Retirée")).toBeInTheDocument());
  });
});
