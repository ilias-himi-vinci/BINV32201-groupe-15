# Bilan — Semaine 4 (Skills & TDD)

## 1. Audit de couverture des tests (`test-gap-audit` sur EF-32 et EF-33)

### Démarche
Le skill `test-gap-audit` a été installé dans `.github/skills/test-gap-audit/` et exécuté en lecture seule sur le périmètre des candidatures (`EF-32` et `EF-33`). Les constats remontés par Copilot ont ensuite été vérifiés manuellement dans les fichiers de code et de tests (`backend/tests/applications.test.ts`, `frontend/tests/ApplicationsPage.test.tsx`, `frontend/tests/guards.test.ts`, `backend/tests/db/migrations.test.ts`).

### Vérification des constats

| Cas à vérifier | Test existant et assertion utile | Manque confirmé ou constat écarté |
| :--- | :--- | :--- |
| **Isolation et ordre de `GET /applications`** (ne voir que ses propres candidatures, triées du plus récent au plus ancien) | `backend/tests/applications.test.ts` vérifiait le statut `200` et le rejet d'un administrateur, mais avec **une seule candidature** en base. | **Manque confirmé (P1)** : le tri chronologique décroissant et l'isolation face aux candidatures d'un autre étudiant n'étaient pas démontrés. |
| **Authentification directe de `GET` et `PATCH /applications/:id/withdraw`** | `POST` testait le `401` et le `403`, et `GET` testait le `403` admin, mais `PATCH` ne testait ni l'absence de session (`401`) ni un mauvais rôle (`403`). | **Manque confirmé (P1)** : une régression sur le middleware d'authentification ou de rôle sur `PATCH` n'était pas couverte. |
| **Gardes de type frontend `isApplication` / `isApplicationList`** | `frontend/tests/guards.test.ts` testait les gardes d'offres et d'utilisateurs, sans importer `isApplication` ni `isApplicationList`. | **Manque confirmé (P1)** : validation de contrat API non testée côté frontend. |
| **Annulation du retrait (`window.confirm` à `false`)** | `frontend/tests/ApplicationsPage.test.tsx` couvrait uniquement la confirmation acceptée (`true`). | **Manque confirmé (P2)** : aucun test ne garantissait l'absence d'appel `PATCH` lorsque l'utilisateur clique sur « Annuler ». |
| **Refus de candidature sur offre non publiée et retrait sur statut non retirable** | Déjà couverts par des assertions dédiées dans `backend/tests/applications.test.ts`. | **Constat écarté** : comportement déjà solidement protégé. |

### Action réalisée suite à l'audit
- Ajout d'un test d'intégration dans `backend/tests/applications.test.ts` créant trois candidatures à des dates distinctes pour Lucas Dupont et une candidature pour Mateusz Kowalski, vérifiant que `GET /applications` ne retourne que les 3 candidatures de Lucas, ordonnées du plus récent au plus ancien (`[102, 103, 101]`).
- Exécution de la suite : **24/24 tests backend réussis**.

---

## 2. Développement guidé par les tests (`test-driven-development` sur EF-30)

### Configuration du workflow
- Installation du skill `test-driven-development` dans `.github/skills/test-driven-development/` avec ajout de la consigne d'arrêt obligatoire après l'écriture et l'exécution des tests en échec.
- Ajout de la règle de déclenchement automatique dans `.github/copilot-instructions.md` pour que tout ajout de fonctionnalité ou correction de bug passe d'abord par ce skill.

### Cycle Red → Green observé
1. **Déclenchement automatique et phase RED (tests avant code) :**
   Sans mentionner le TDD ni invoquer manuellement le skill, Copilot a lu `SKILL.md`, ajouté les tests backend (`backend/tests/offers.test.ts`) et frontend (`frontend/tests/OffersPage.test.tsx`), les a exécutés et s'est arrêté pour demander validation avant de toucher au code applicatif.
   - **Exemple de test en échec avant implémentation** (`backend/tests/offers.test.ts`) :
```ts
it("cherche sans tenir compte de la casse et ignore les espaces autour", async () => {
  const response = await listOffersAs("ADMIN", ADMINISTRATOR.ANNE_LECLERCQ)
    .query({ q: "  TABLEAU DE BORD  " });

  expect(response.status).toBe(200);
  expect(offerIds(response.body)).toEqual([OFFER.DATA_QUALITY]);
});
```
   - **Résultat observé avant implémentation** : 4 tests backend et 2 tests frontend en échec (le paramètre `q` était ignoré par l'API et le champ de recherche n'existait pas dans l'interface).

2. **Phase GREEN (implémentation minimale et validation) :**
   Après validation explicite des tests, Copilot a implémenté le filtrage par mot-clé (`q`) sur le titre côté repository/service/contrôleur backend (insensible à la casse, `trim`, expression complète, combiné au filtre de période et à la visibilité par rôle, limite à 100 caractères) ainsi que le champ de recherche et l'état vide côté frontend.
   - **Résultats après implémentation** :
     - Tests ciblés backend : **19/19 réussis**
     - Tests ciblés frontend : **11/11 réussis**
     - `npm run check` : **200/200 tests réussis** et builds validés.

3. **Vérification manuelle :**
   - Test effectué dans le navigateur avec le profil étudiant (Lucas Dupont) : la recherche filtre uniquement les offres publiées, ignore la casse et les espaces superflus, affiche le message adapté lorsqu'aucune offre ne correspond et se combine correctement avec le filtre par période.

---

## 3. État des crédits d'IA du groupe

- **Offre utilisée :** GitHub Copilot Free
- **Consommation actuelle du groupe :**
  - **Chat messages :** 14,1 % utilisés (85,9 % restants)
  - **Inline Suggestions :** 0 % utilisés (100 % restants)
- **Renouvellement du quota :** 1er décembre 2026 à 01h00

