User: Implémente le filtre par période sur la page des offres.
- Choix : Toutes les périodes, P1, P2, Autre (code OTHER).
- Le filtre est transmis à l'API : GET /offers?period=P1. Il est facultatif.
- Sans filtre, toutes les offres normalement visibles restent affichées.
- Les règles de visibilité liées au profil ne changent pas.
- Aucune nouvelle dépendance, aucune migration de base de données.
- Une valeur de période inconnue renvoie une erreur 400.
- Ajoute ou adapte les tests backend et frontend.
- N'installe rien et ne touche pas à git.
Limite-toi aux fichiers listés dans docs/parcours-affichage-offres.html.

Copilot: Je vais d’abord relever précisément les fichiers autorisés dans le parcours, puis suivre le flux offres backend/frontend et adapter les tests uniquement dans ce périmètre.

Read 
Completed with input: {
  "path": "C:\\ecole ilias\\3eme\\ia\\s6\\BINV32201-groupe-15\\docs\\parcours-affichage-offres.html"
}

Read 
Completed with input: {
  "path": "C:\\ecole ilias\\3eme\\ia\\s6\\BINV32201-groupe-15\\backend\\src\\controllers\\offers.controller.ts"
}

Read 
Completed with input: {
  "path": "C:\\ecole ilias\\3eme\\ia\\s6\\BINV32201-groupe-15\\backend\\src\\services\\offers.service.ts"
}

Read 
Completed with input: {
  "path": "C:\\ecole ilias\\3eme\\ia\\s6\\BINV32201-groupe-15\\backend\\src\\repositories\\offers.repository.ts"
}

Read 
Completed with input: {
  "path": "C:\\ecole ilias\\3eme\\ia\\s6\\BINV32201-groupe-15\\backend\\src\\models\\offer.ts"
}

Read 
Completed with input: {
  "path": "C:\\ecole ilias\\3eme\\ia\\s6\\BINV32201-groupe-15\\backend\\tests\\offers.test.ts"
}

Read 
Completed with input: {
  "path": "C:\\ecole ilias\\3eme\\ia\\s6\\BINV32201-groupe-15\\frontend\\src\\pages\\OffersPage.tsx"
}

"Read" failed
Completed with input: {
  "path": "C:\\ecole ilias\\3eme\\ia\\s6\\BINV32201-groupe-15\\frontend\\src\\services\\offers.ts"
}
Tool execution failed: Path does not exist

Read 
Completed with input: {
  "path": "C:\\ecole ilias\\3eme\\ia\\s6\\BINV32201-groupe-15\\frontend\\tests\\OffersPage.test.tsx"
}

Search for `backend|frontend|offers|OffersPage|useOffers|tests`

Find files matching `frontend/src/**/*offer*`

Find files matching `frontend/tests/**/*offer*`

Read 
Completed with input: {
  "path": "C:\\ecole ilias\\3eme\\ia\\s6\\BINV32201-groupe-15\\frontend\\src\\hooks\\useOffers.ts"
}

"Read" failed
Completed with input: {
  "path": "C:\\ecole ilias\\3eme\\ia\\s6\\BINV32201-groupe-15\\frontend\\src\\services\\api.ts"
}
Tool execution failed: Path does not exist

Read 
Completed with input: {
  "path": "C:\\ecole ilias\\3eme\\ia\\s6\\BINV32201-groupe-15\\frontend\\src\\models\\offer.ts"
}

Read 
Completed with input: {
  "path": "C:\\ecole ilias\\3eme\\ia\\s6\\BINV32201-groupe-15\\frontend\\tests\\helpers\\fetchMock.ts"
}

Le parcours autorise explicitement les couches UI, hook/service, contrôleur/service/repository et les tests/documentation d’offres. Je vérifie maintenant les contrats existants et les conventions d’erreur avant l’édition.

Read 
Completed with input: {
  "path": "C:\\ecole ilias\\3eme\\ia\\s6\\BINV32201-groupe-15\\frontend\\src\\services\\offers.service.ts"
}

Read , lines 1 to 220
Completed with input: {
  "path": "C:\\ecole ilias\\3eme\\ia\\s6\\BINV32201-groupe-15\\backend\\API.md",
  "view_range": [
    1,
    220
  ]
}

Read 
Completed with input: {
  "path": "C:\\ecole ilias\\3eme\\ia\\s6\\BINV32201-groupe-15\\backend\\http\\offers.http"
}

Read 
Completed with input: {
  "path": "C:\\ecole ilias\\3eme\\ia\\s6\\BINV32201-groupe-15\\backend\\src\\utils\\httpError.ts"
}

Read 
Completed with input: {
  "path": "C:\\ecole ilias\\3eme\\ia\\s6\\BINV32201-groupe-15\\frontend\\src\\utils\\api.ts"
}

Read 
Completed with input: {
  "path": "C:\\ecole ilias\\3eme\\ia\\s6\\BINV32201-groupe-15\\frontend\\src\\utils\\labels.ts"
}

Read 
Completed with input: {
  "path": "C:\\ecole ilias\\3eme\\ia\\s6\\BINV32201-groupe-15\\package.json"
}

Read 
Completed with input: {
  "path": "C:\\ecole ilias\\3eme\\ia\\s6\\BINV32201-groupe-15\\backend\\package.json"
}

Read 
Completed with input: {
  "path": "C:\\ecole ilias\\3eme\\ia\\s6\\BINV32201-groupe-15\\frontend\\package.json"
}

"Apply Patch" failed
Completed with input: "*** Begin Patch\n*** Update File: C:\\ecole ilias\\3eme\\ia\\s6\\BINV32201-groupe-15\\backend\\src\\repositories\\offers.repository.ts\n@@\n-import type { OfferDbo, OfferStatus } from \"../models/offer.ts\";\n+import type { OfferDbo, OfferStatus, PeriodCode } from \"../models/offer.ts\";\n@@\n   /** Limite aux offres déposées par ce contact. */\n   depositorContactId?: number;\n+  /** Limite aux offres de cette période. */\n+  period?: PeriodCode;\n }\n \n interface FindAllParams {\n   status: OfferStatus | null;\n   depositorContactId: number | null;\n+  period: PeriodCode | null;\n }\n@@\n       AND (@status IS NULL OR o.status = @status)\n       AND (@depositorContactId IS NULL OR o.depositor_contact_id = @depositorContactId)\n+      AND (@period IS NULL OR p.code = @period)\n@@\n-    findAll: ({ status, depositorContactId }: OfferFilter): OfferDbo[] =>\n-      findAll.all({ status: status ?? null, depositorContactId: depositorContactId ?? null }),\n+    findAll: ({ status, depositorContactId, period }: OfferFilter): OfferDbo[] =>\n+      findAll.all({\n+        status: status ?? null,\n+        depositorContactId: depositorContactId ?? null,\n+        period: period ?? null,\n+      }),\n*** Update File: C:\\ecole ilias\\3eme\\ia\\s6\\BINV32201-groupe-15\\backend\\src\\services\\offers.service.ts\n@@\n-import type { Offer } from \"../models/offer.ts\";\n+import type { Offer, PeriodCode } from \"../models/offer.ts\";\n@@\n-  listOffers: (viewer: User): Offer[] => repository.findAll(visibilityFilter(viewer)).map(toOffer),\n+  listOffers: (viewer: User, period?: PeriodCode): Offer[] =>\n+    repository.findAll({ ...visibilityFilter(viewer), period }).map(toOffer),\n });\n*** Update File: C:\\ecole ilias\\3eme\\ia\\s6\\BINV32201-groupe-15\\backend\\src\\controllers\\offers.controller.ts\n@@\n import type { OffersService } from \"../services/offers.service.ts\";\n import { canListOffers } from \"../services/permissions.ts\";\n+import { HttpError } from \"../utils/httpError.ts\";\n+import { PERIOD_CODES, type PeriodCode } from \"../models/offer.ts\";\n+\n+const readPeriod = (value: unknown): PeriodCode | undefined => {\n+  if (value === undefined) return undefined;\n+  if (typeof value !== \"string\" || !PERIOD_CODES.includes(value as PeriodCode)) {\n+    throw new HttpError(400, \"INVALID_QUERY\", \"Le paramètre period est invalide\");\n+  }\n+  return value as PeriodCode;\n+};\n@@\n   router.get(\"/\", authorize(canListOffers), (req, res) => {\n-    res.json(offersService.listOffers(getCurrentUser(req)).map(toOfferDto));\n+    res.json(offersService.listOffers(getCurrentUser(req), readPeriod(req.query.period)).map(toOfferDto));\n   });\n*** Update File: C:\\ecole ilias\\3eme\\ia\\s6\\BINV32201-groupe-15\\frontend\\src\\services\\offers.service.ts\n@@\n import type { Offer } from \"../models/offer.ts\";\n+import type { PeriodCode } from \"../models/offer.ts\";\n@@\n-export const getOffers = async (token: string, signal?: AbortSignal): Promise<Offer[]> => {\n-  const response = await fetch(`${API_URL}/offers`, {\n+export const getOffers = async (\n+  token: string,\n+  period?: PeriodCode,\n+  signal?: AbortSignal,\n+): Promise<Offer[]> => {\n+  const query = period === undefined ? \"\" : `?period=${encodeURIComponent(period)}`;\n+  const response = await fetch(`${API_URL}/offers${query}`, {\n*** Update File: C:\\ecole ilias\\3eme\\ia\\s6\\BINV32201-groupe-15\\frontend\\src\\hooks\\useOffers.ts\n@@\n import type { Offer } from \"../models/offer.ts\";\n+import type { PeriodCode } from \"../models/offer.ts\";\n@@\n-export const useOffers = (token: string, onUnauthorized: () => void) => {\n+export const useOffers = (token: string, period: PeriodCode | undefined, onUnauthorized: () => void) => {\n@@\n   useEffect(() => {\n     const controller = new AbortController();\n+    setIsLoading(true);\n+    setError(null);\n \n-    getOffers(token, controller.signal)\n+    getOffers(token, period, controller.signal)\n@@\n-  }, [token, onUnauthorized]);\n+  }, [token, period, onUnauthorized]);\n*** Update File: C:\\ecole ilias\\3eme\\ia\\s6\\BINV32201-groupe-15\\frontend\\src\\pages\\OffersPage.tsx\n@@\n import type { User } from \"../models/user.ts\";\n+import { PERIOD_CODES, type PeriodCode } from \"../models/offer.ts\";\n+import { PERIOD_LABELS } from \"../utils/labels.ts\";\n@@\n const OffersPage = ({ user, token, onUnauthorized }: OffersPageProps) => {\n-  const { offers, isLoading, error } = useOffers(token, onUnauthorized);\n+  const [period, setPeriod] = useState<PeriodCode | undefined>(undefined);\n+  const { offers, isLoading, error } = useOffers(token, period, onUnauthorized);\n@@\n       <h1>Offres de stage</h1>\n       <p>{DESCRIPTIONS[user.kind]}</p>\n+      <label>\n+        Période\n+        <select\n+          aria-label=\"Période\"\n+          value={period ?? \"\"}\n+          onChange={(event) => setPeriod(event.target.value === \"\" ? undefined : event.target.value as PeriodCode)}\n+        >\n+          <option value=\"\">Toutes les périodes</option>\n+          {PERIOD_CODES.map((code) => <option key={code} value={code}>{PERIOD_LABELS[code]}</option>)}\n+        </select>\n+      </label>\n       {renderContent()}\n*** End Patch\n"
Tool execution failed: Failed to apply patch: Error: Failed to find expected lines in C:\ecole ilias\3eme\ia\s6\BINV32201-groupe-15\backend\src\repositories\offers.repository.ts:
      AND (@status IS NULL OR o.status = @status)
      AND (@depositorContactId IS NULL OR o.depositor_contact_id = @depositorContactId)

Read , lines 1 to 80
Completed with input: {
  "path": "C:\\ecole ilias\\3eme\\ia\\s6\\BINV32201-groupe-15\\backend\\src\\repositories\\offers.repository.ts",
  "view_range": [
    1,
    80
  ]
}

Read , lines 1 to 100
Completed with input: {
  "path": "C:\\ecole ilias\\3eme\\ia\\s6\\BINV32201-groupe-15\\frontend\\src\\pages\\OffersPage.tsx",
  "view_range": [
    1,
    100
  ]
}

Edit , , , , , 

Search for `useOffers\(|getOffers\(`

Search for `listOffers\(`

Search for `GET /offers|period`

L’implémentation du filtre est en place sans modifier le schéma : la visibilité est d’abord calculée par rôle, puis la période est ajoutée au même filtre SQL. J’ajoute les cas de contrat (P1/OTHER, valeur invalide et visibilité) ainsi que le comportement de sélection/rechargement côté UI.

Edit , , , 

Search for `periodCode|period:|period_id|P1|P2|OTHER`

Search for `useOffers|offers.service|OffersPage`

Ran terminal command: npm run typecheck -w backend; if ($LASTEXITCODE -eq 0) { npm run typecheck -w frontend }
Tool execution failed with exit code 1

Read , lines 1 to 180
Completed with input: {
  "path": "C:\\ecole ilias\\3eme\\ia\\s6\\BINV32201-groupe-15\\backend\\src\\db\\seed\\offersData.ts",
  "view_range": [
    1,
    180
  ]
}

Read , lines 180 to 280
Completed with input: {
  "path": "C:\\ecole ilias\\3eme\\ia\\s6\\BINV32201-groupe-15\\backend\\src\\db\\seed\\offersData.ts",
  "view_range": [
    180,
    280
  ]
}

Ran terminal command: Get-Command npm | Select-Object -ExpandProperty Source; node --version

Edit 

Ran terminal command: cmd /c npm run typecheck -w backend
Tool execution failed with exit code 2

Ran terminal command: cmd /c npm run typecheck -w frontend

Ran terminal command: cmd /c npm test -w backend -- --run tests/offers.test.ts
Tool execution failed with exit code 1

Ran terminal command: cmd /c npm test -w frontend -- --run tests/OffersPage.test.tsx
Tool execution failed with exit code 1

Edit 

Ran terminal command: cmd /c npm run typecheck -w backend

Ran terminal command: cmd /c npm test -w backend -- --run tests/offers.test.ts

Ran terminal command: cmd /c npm test -w frontend -- --run tests/OffersPage.test.tsx --pool=threads --maxWorkers=1 --minWorkers=1
Tool execution failed with exit code 1

Ran terminal command: cmd /c npm test -w frontend -- --run tests/OffersPage.test.tsx --pool=threads --maxWorkers=1
Tool execution failed with exit code 1

Edit 

Les tests backend ciblés passent. Le test frontend a révélé uniquement une ambiguïté de sélecteur due au nouveau libellé « Autre » dans la liste déroulante ; le test est ajusté pour distinguer les deux occurrences, puis je relance les validations ciblées et le lint.

Ran terminal command: cmd /c npm run typecheck -w frontend

Ran terminal command: cmd /c npm run lint -w backend

Ran terminal command: cmd /c npm run lint -w frontend
Tool execution failed with exit code 1

Ran terminal command: cmd /c npm test -w frontend -- --run tests/OffersPage.test.tsx --pool=threads --maxWorkers=1

Ran terminal command: cmd /c npm test -w backend -- --run tests/offers.test.ts

Edit 

Ran terminal command: cmd /c npm run lint -w frontend

Ran terminal command: cmd /c npm run typecheck -w frontend

Ran terminal command: cmd /c npm test -w frontend -- --run tests/OffersPage.test.tsx --pool=threads --maxWorkers=1

Read , lines 133 to 180
Completed with input: {
  "path": "C:\\ecole ilias\\3eme\\ia\\s6\\BINV32201-groupe-15\\backend\\API.md",
  "view_range": [
    133,
    180
  ]
}

Read 
Completed with input: {
  "path": "C:\\ecole ilias\\3eme\\ia\\s6\\BINV32201-groupe-15\\backend\\src\\controllers\\offers.controller.ts"
}

Read 
Completed with input: {
  "path": "C:\\ecole ilias\\3eme\\ia\\s6\\BINV32201-groupe-15\\frontend\\src\\pages\\OffersPage.tsx"
}

Read 
Completed with input: {
  "path": "C:\\ecole ilias\\3eme\\ia\\s6\\BINV32201-groupe-15\\frontend\\src\\hooks\\useOffers.ts"
}

Search for `` Paramètre facultatif `period` ``

Read , lines 68 to 84
Completed with input: {
  "path": "C:\\ecole ilias\\3eme\\ia\\s6\\BINV32201-groupe-15\\backend\\API.md",
  "view_range": [
    68,
    84
  ]
}

Read , lines 1 to 8
Completed with input: {
  "path": "C:\\ecole ilias\\3eme\\ia\\s6\\BINV32201-groupe-15\\frontend\\src\\pages\\OffersPage.tsx",
  "view_range": [
    1,
    8
  ]
}

Edit , 

Implémentation terminée du filtre par période sur la page des offres.

### Changements

- Ajout du filtre facultatif `period` côté API :
  - `P1`
  - `P2`
  - `OTHER`
- Valeur inconnue ou invalide → réponse `400 INVALID_QUERY`.
- Conservation des règles de visibilité selon le profil.
- Filtrage SQL sur le code de période.
- Ajout du sélecteur « Toutes les périodes / P1 / P2 / Autre » dans la page offres.
- Transmission de `?period=P1` à l’API et rechargement des données.
- Documentation API et exemple HTTP mis à jour.
- Tests backend et frontend ajoutés/adaptés.

Fichiers principaux :
- `offers.controller.ts`
- `offers.service.ts`
- `offers.repository.ts`
- `OffersPage.tsx`
- `useOffers.ts`

### Validation

- Backend typecheck : réussi
- Frontend typecheck : réussi
- Backend lint : réussi
- Frontend lint : réussi
- Tests backend offres : **13 réussis**
- Tests frontend offres : **5 réussis**

Aucune dépendance, migration ou modification Git n’a été ajoutée.