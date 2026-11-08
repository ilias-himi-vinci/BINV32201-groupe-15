import { useState, type FormEvent } from "react";
import EmptyState from "../components/EmptyState.tsx";
import ErrorState from "../components/ErrorState.tsx";
import LoadingState from "../components/LoadingState.tsx";
import OfferTable from "../components/OfferTable.tsx";
import { useOffers } from "../hooks/useOffers.ts";
import type { User } from "../models/user.ts";
import { PERIOD_CODES, type PeriodCode } from "../models/offer.ts";
import { PERIOD_LABELS } from "../utils/labels.ts";
import { useApplyToOffer } from "../hooks/useApplyToOffer.ts";
import type { Offer } from "../models/offer.ts";

interface OffersPageProps {
  user: User;
  token: string;
  onUnauthorized: () => void;
}

const DESCRIPTIONS = {
  ADMIN: "Toutes les offres, tous statuts confondus.",
  STUDENT: "Les offres publiées.",
  CONTACT: "Les offres que vous avez déposées.",
} as const;

const OffersPage = ({ user, token, onUnauthorized }: OffersPageProps) => {
  const [period, setPeriod] = useState<PeriodCode | undefined>(undefined);
  const { offers, isLoading, error } = useOffers(token, period, onUnauthorized);
  const { apply, appliedOfferId, error: applicationError, isSubmitting } =
    useApplyToOffer(token, onUnauthorized);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [message, setMessage] = useState("");

  const submitApplication = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedOffer === null) return;
    if (await apply(selectedOffer.id, message)) {
      setSelectedOffer(null);
      setMessage("");
    }
  };

  const renderContent = () => {
    if (error) return <ErrorState message={error} />;
    if (isLoading) return <LoadingState />;
    if (offers.length === 0) return <EmptyState message="Aucune offre à afficher." />;
    return (
      <>
        <p className="result-count">
          {offers.length} offre{offers.length > 1 ? "s" : ""}
        </p>
        <OfferTable
          offers={offers}
          onApply={user.kind === "STUDENT" ? setSelectedOffer : undefined}
          appliedOfferId={appliedOfferId}
        />
      </>
    );
  };

  return (
    <section>
      <h1>Offres de stage</h1>
      <p>{DESCRIPTIONS[user.kind]}</p>
      <label>
        Période
        <select
          aria-label="Période"
          value={period ?? ""}
          onChange={(event) =>
            setPeriod(event.target.value === "" ? undefined : event.target.value as PeriodCode)
          }
        >
          <option value="">Toutes les périodes</option>
          {PERIOD_CODES.map((code) => (
            <option key={code} value={code}>{PERIOD_LABELS[code]}</option>
          ))}
        </select>
      </label>
      {renderContent()}
      {applicationError && <ErrorState message={applicationError} />}
      {selectedOffer && (
        <form onSubmit={submitApplication}>
          <h2>Candidater à « {selectedOffer.title} »</h2>
          <label>
            Message (facultatif)
            <textarea
              aria-label="Message (facultatif)"
              maxLength={500}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </label>
          <button className="button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Envoi..." : "Envoyer ma candidature"}
          </button>
          <button className="button" type="button" onClick={() => setSelectedOffer(null)}>
            Annuler
          </button>
        </form>
      )}
    </section>
  );
};

export default OffersPage;
