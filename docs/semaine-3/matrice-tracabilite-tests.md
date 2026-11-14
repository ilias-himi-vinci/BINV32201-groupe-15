# Matrice de traçabilité exigences ↔ tests Gesta

## 1. Objet et périmètre

Cette matrice recense les exigences et spécifications réellement exprimées dans le dépôt, puis les relie aux tests existants dans [backend/tests](../../backend/tests) et [frontend/tests](../../frontend/tests).

Les sources de référence sont :

- [README.md](../../README.md)
- [backend/API.md](../../backend/API.md)
- [AGENTS.md](../../AGENTS.md)
- [docs/architecture.md](../architecture.md)
- [backend/src/db/migrations](../../backend/src/db/migrations)
- [backend/src/services](../../backend/src/services)
- [frontend/src/pages](../../frontend/src/pages)

La démarche consiste à distinguer :

- les exigences actuellement implémentées et testées ;
- les exigences partiellement couvertes ;
- les écarts de test à prioriser pour renforcer la qualité.

> Cette matrice a été mise à jour après ajout des tests critiques de robustesse et de sécurité. Les blocs de test ci-dessous reflètent précisément le code présent dans les fichiers de test de l’API et du frontend.

---

## 2. Sources d’exigences retenues

### 2.1. Exigences fonctionnelles et techniques explicites

| Domaine | Source | Exigence clé |
|---|---|---|
| Authentification démo | [README.md](../../README.md), [backend/API.md](../../backend/API.md) | L’authentification locale se fait via un mode démo sans mot de passe ; les droits sont relus en base. |
| Sécurité | [AGENTS.md](../../AGENTS.md), [backend/API.md](../../backend/API.md) | Les routes protégées exigent un jeton ; le backend revalide les droits et les entreprises à chaque requête. |
| Entreprises | [backend/API.md](../../backend/API.md) | L’admin voit toutes les entreprises ; les autres ne voient que les actives. |
| Offres | [backend/API.md](../../backend/API.md) | Un administrateur voit toutes les offres ; un étudiant voit les offres publiées ; un déposant voit ses offres. |
| Candidatures | [backend/API.md](../../backend/API.md) | Un étudiant ne peut postuler qu’à une offre publiée, avec gestion de doublon et retrait. |
| Intégrité DB | [docs/architecture.md](../architecture.md), [backend/src/db/migrations](../../backend/src/db/migrations) | Les clés étrangères, uniques et contraintes métier sont vérifiées côté base. |
| Frontend | [docs/architecture.md](../architecture.md), [frontend/src/App.tsx](../../frontend/src/App.tsx) | Navigation adaptée au profil, gestion de session, états de chargement/erreur/vide. |
| Validation front | [frontend/src/utils/guards.ts](../../frontend/src/utils/guards.ts) | Les réponses JSON de l’API sont validées avant affichage. |

### 2.2. Exigences non implémentées, à traiter comme écarts qualitatifs

Le dépôt indique explicitement que plusieurs fonctionnalités du cahier des charges ne sont pas encore développées, notamment dans [README.md](../../README.md) :

- création, modification et retrait d’offres par un déposant ;
- validation de l’offre par un administrateur ;
- sélection d’un candidat et création d’un stage ;
- gestion des entreprises, rôles, doublons ;
- connexion réelle par e-mail ;
- exports, conventions, années académiques avancées.

Ces points ne figurent pas dans la traceabilité “implémentée” car ils ne sont ni codés ni testés dans le dépôt actuel.

---

## 3. Catalogue des exigences testées

### R1 — Authentification démo et session

- L’API expose les comptes de démonstration actifs et les contacts ayant au moins un rôle.
- Une connexion démo retourne un token JWT et l’utilisateur relu depuis la base.
- Le token ne contient que l’identité, pas les rôles ni les entreprises.
- Une session invalide ou expirée est rejetée avec `401`.

Couvert par :

- [backend/tests/auth.test.ts](../../backend/tests/auth.test.ts) — `GET /auth/demo-users`, `POST /auth/demo-login`, `GET /auth/me`, garde du mode démo
- [frontend/tests/App.test.tsx](../../frontend/tests/App.test.tsx) — session locale, reprise de session, annulation d’une session refusée
- [frontend/tests/LoginPage.test.tsx](../../frontend/tests/LoginPage.test.tsx) — affichage des utilisateurs de démonstration et échec de connexion

Statut : Couvert

### R2 — Sécurité, autorisation et rechargement des droits

- Les routes protégées exigent l’en-tête `Authorization`.
- Les rôles et entreprises sont rechargés depuis la base à chaque requête.
- Un contact sans rôle ou un compte désactivé est rejeté.
- Les rôles envoyés par le client sont ignorés.

Couvert par :

- [backend/tests/auth.test.ts](../../backend/tests/auth.test.ts) — tests de jeton invalide, compte désactivé, rechargement des rôles, rejet des rôles client
- [backend/tests/permissions.test.ts](../../backend/tests/permissions.test.ts) — règles d’accès statiques

Statut : Couvert

### R3 — Liste et recherche des entreprises

- L’admin voit toutes les entreprises.
- Les autres profils ne voient que les entreprises actives.
- La recherche `q` filtre par nom complet / abrégé, insensible à la casse.
- La recherche vide et les erreurs de query sont gérées.

Couvert par :

- [backend/tests/companies.test.ts](../../backend/tests/companies.test.ts) — accès + recherche + invalidations
- [frontend/tests/CompaniesPage.test.tsx](../../frontend/tests/CompaniesPage.test.tsx) — affichage, recherche, erreur, 401, résultat vide

Statut : Couvert

### R4 — Visibilité des offres selon le profil

- Admin : toutes les offres.
- Étudiant : seules les offres publiées.
- Déposant : ses offres, quel que soit le statut.
- Contact sans rôle de déposant : accès refusé avec `403`.
- Option de filtre par période.

Couvert par :

- [backend/tests/offers.test.ts](../../backend/tests/offers.test.ts) — accès, visibilité, filtre période, erreurs `400`/`403`
- [frontend/tests/OffersPage.test.tsx](../../frontend/tests/OffersPage.test.tsx) — affichage, description selon profil, période, accès refusé, 401, candidature
- [frontend/tests/NavBar.test.tsx](../../frontend/tests/NavBar.test.tsx) — menu de navigation selon rôle

Statut : Couvert

### R5 — Candidatures : création et validation métier

- Un étudiant peut candidater à une offre publiée.
- Le message est optionnel et éventuellement normalisé à `null`.
- Les offres inconnues, non publiées ou invalides sont refusées.
- Le message > 500 caractères est rejeté.
- Un doublon actif est rejeté avec `409`.

Couvert par :

- [backend/tests/applications.test.ts](../../backend/tests/applications.test.ts) — `POST /applications` et validations métier
- [frontend/tests/OffersPage.test.tsx](../../frontend/tests/OffersPage.test.tsx) — formulaire de candidature, message facultatif, refus métier, session expirée

Statut : Couvert

### R6 — Historique et consultation des candidatures

- Un étudiant voit son historique complet, trié par date décroissante.
- Les profils non étudiants reçoivent `403`.
- Le DTO expose uniquement les champs attendus.

Couvert par :

- [backend/tests/applications.test.ts](../../backend/tests/applications.test.ts) — `GET /applications`
- [frontend/tests/ApplicationsPage.test.tsx](../../frontend/tests/ApplicationsPage.test.tsx) — historique, libellés, état vide, session expirée, retrait

Statut : Couvert

### R7 — Retrait d’une candidature en cours

- Un étudiant peut retirer son application tant qu’elle est `IN_PROGRESS`.
- La candidature n’est pas supprimée ; elle passe en `WITHDRAWN`.
- Un autre étudiant ou candidature déjà traitée est refusé.
- Une nouvelle candidature est ensuite autorisée.

Couvert par :

- [backend/tests/applications.test.ts](../../backend/tests/applications.test.ts) — `PATCH /applications/:id/withdraw`
- [frontend/tests/ApplicationsPage.test.tsx](../../frontend/tests/ApplicationsPage.test.tsx) — confirmation + retrait

Statut : Couvert

### R8 — Intégrité et contraintes SQL de la base

- Les migrations sont versionnées et appliquées une seule fois.
- Les clés étrangères sont actives.
- Les contraintes de type, unique, statut, date et relation sont validées.
- Les données de seed sont cohérentes avec les règles métier.

Couvert par :

- [backend/tests/db/migrations.test.ts](../../backend/tests/db/migrations.test.ts)
- [backend/tests/db/constraints.test.ts](../../backend/tests/db/constraints.test.ts)
- [backend/tests/db/seed.test.ts](../../backend/tests/db/seed.test.ts)

Statut : Couvert

### R9 — Disponibilité API et format de réponse standardisé

- `GET /health` répond `200 { status: "ok" }`.
- Les routes inconnues renvoient une erreur JSON standardisée.
- Les erreurs HTTP sont sérialisées selon un contrat unique.

Couvert par :

- [backend/tests/health.test.ts](../../backend/tests/health.test.ts)
- [backend/API.md](../../backend/API.md)

Statut : Couvert

### R10 — Frontend : session, navigation et accès selon profil

- Sans session, la page de connexion s’affiche.
- Avec session valide, la navigation est restaurée.
- Le logout supprime la session locale et revient vers la connexion.
- Les routes visibles diffèrent selon le profil.

Couvert par :

- [frontend/tests/App.test.tsx](../../frontend/tests/App.test.tsx)
- [frontend/tests/NavBar.test.tsx](../../frontend/tests/NavBar.test.tsx)
- [frontend/tests/HomePage.test.tsx](../../frontend/tests/HomePage.test.tsx)

Statut : Couvert

### R11 — Frontend : états de page et gestion des erreurs utilisateur

- État de chargement, état vide, erreur API, 401, messages métiers.
- Les données sont correctement affichées selon les libellés français.

Couvert par :

- [frontend/tests/CompaniesPage.test.tsx](../../frontend/tests/CompaniesPage.test.tsx)
- [frontend/tests/OffersPage.test.tsx](../../frontend/tests/OffersPage.test.tsx)
- [frontend/tests/ApplicationsPage.test.tsx](../../frontend/tests/ApplicationsPage.test.tsx)
- [frontend/tests/HomePage.test.tsx](../../frontend/tests/HomePage.test.tsx)

Statut : Couvert

### R12 — Validation runtime côté frontend

- Les objets de réponse API sont validés via type guards.
- Les réponses invalides ou inattendues sont refusées.

Couvert par :

- [frontend/tests/guards.test.ts](../../frontend/tests/guards.test.ts)
- [frontend/src/utils/guards.ts](../../frontend/src/utils/guards.ts)

Statut : Couvert

---

## 4. Matrice de traçabilité complète

| ID | Exigence | Blocs de test exacts | Statut | Commentaire |
|---|---|---|---|---|
| R1 | Session démo + JWT sans droits | [backend/tests/auth.test.ts](../../backend/tests/auth.test.ts) — `describe("GET /auth/demo-users")`, `it("propose uniquement les comptes actifs et les contacts qui ont un rôle")`; `describe("POST /auth/demo-login")`, `it("retourne un jeton et l'utilisateur relu en base")`, `it("ne place que l'identité dans le jeton, jamais les droits")`; `describe("GET /auth/me")`, `it("refuse le jeton d'un compte désactivé depuis la connexion")`; [frontend/tests/App.test.tsx](../../frontend/tests/App.test.tsx) — `describe("App : session")`, `it("affiche la connexion de démo sans session")`, `it("ouvre une session et la conserve")`, `it("reprend une session enregistrée confirmée par le backend")`; [frontend/tests/LoginPage.test.tsx](../../frontend/tests/LoginPage.test.tsx) — `describe("LoginPage")`, `it("regroupe les utilisateurs de démo par profil")`, `it("se connecte avec l'utilisateur choisi")` | Couvert | Sécurisation locale correcte et vérifiée. |
| R2 | Autorisation relayée depuis la base | [backend/tests/auth.test.ts](../../backend/tests/auth.test.ts) — `describe("GET /auth/me")`, `it("refuse une route protégée quand le compte est désactivé après l'authentification")`, `it("relit les rôles en base à chaque requête")`; `describe("rôles déclarés par le client")`, `it("ignore un rôle envoyé dans un en-tête, la requête ou le corps")`; [backend/tests/permissions.test.ts](../../backend/tests/permissions.test.ts) — `describe("règles d'accès")`, `it("reconnaît un administrateur")`, `it("n'attribue des rôles de contact qu'aux contacts")`, `it.each(...)` | Couvert | Revalidation des rôles et comptes désactivés testée. |
| R3 | Entreprises visibles selon le profil et recherche | [backend/tests/companies.test.ts](../../backend/tests/companies.test.ts) — `describe("GET /companies : accès")`, `it("montre toutes les entreprises à un administrateur")`, `it.each(...)`; `describe("GET /companies : recherche")`, `it("cherche dans le nom complet et le nom abrégé, sans tenir compte de la casse")`, `it("accepte une recherche de 100 caractères et refuse 101")`, `it("refuse un paramètre q répété")`; [frontend/tests/CompaniesPage.test.tsx](../../frontend/tests/CompaniesPage.test.tsx) — `describe("CompaniesPage")`, `it("affiche les entreprises et leur nombre")`, `it("transmet la recherche saisie à l'API")`, `it("signale une session expirée au lieu d'afficher une erreur")` | Couvert | Couverture solide sur accès, recherche et erreurs. |
| R4 | Offres visibles selon le profil + période | [backend/tests/offers.test.ts](../../backend/tests/offers.test.ts) — `describe("GET /offers : accès")`, `it("refuse une requête sans session (401)")`; `describe("GET /offers : visibilité selon le profil")`, `it("montre toutes les offres à un administrateur")`, `it("ne montre que les offres publiées à un étudiant")`, `it("montre à un déposant toutes ses offres")`, `it("accepte une absence de filtre de période et refuse les valeurs vides ou répétées")`; [frontend/tests/OffersPage.test.tsx](../../frontend/tests/OffersPage.test.tsx) — `describe("OffersPage")`, `it("adapte la description au profil")`, `it("transmet la période sélectionnée et recharge les offres")`, `it("n'affiche pas l'action de candidature aux contacts")`; [frontend/tests/NavBar.test.tsx](../../frontend/tests/NavBar.test.tsx) — `describe("NavBar")`, `it.each(...)` | Couvert | Cas principaux et filtres bien couverts. |
| R5 | Création de candidature + validation + doublon | [backend/tests/applications.test.ts](../../backend/tests/applications.test.ts) — `describe("POST /applications")`, `it("crée une candidature avec un message")`, `it("normalise un message vide comme absent")`, `it("refuse un message de plus de 500 caractères")`, `it.each(...)`, `it("refuse un doublon actif")`; [frontend/tests/OffersPage.test.tsx](../../frontend/tests/OffersPage.test.tsx) — `describe("OffersPage")`, `it("permet à un étudiant de candidater avec un message facultatif")`, `it("affiche une erreur métier lors du refus de candidature")` | Couvert | Cas de création, message vide, 500 chars, doublon et refus métier testés. |
| R6 | Historique candidatures + droits étudiant | [backend/tests/applications.test.ts](../../backend/tests/applications.test.ts) — `describe("GET /applications")`, `it("retourne uniquement les candidatures de l'étudiant, de la plus récente à la plus ancienne")`; [frontend/tests/ApplicationsPage.test.tsx](../../frontend/tests/ApplicationsPage.test.tsx) — `describe("ApplicationsPage")`, `it("affiche tout l'historique dans l'ordre reçu avec les libellés de statut")`, `it("affiche l'état vide")` | Couvert | Historique et restriction par profil validés. |
| R7 | Retrait candidature | [backend/tests/applications.test.ts](../../backend/tests/applications.test.ts) — `describe("PATCH /applications/:id/withdraw")`, `it("retire une candidature en cours sans la supprimer")`, `it("refuse le retrait par un autre étudiant")`, `it("refuse un identifiant de candidature invalide (%s) (400)")`, `it("retourne 404 pour une candidature inconnue")`, `it("permet une nouvelle candidature après le retrait")`; [frontend/tests/ApplicationsPage.test.tsx](../../frontend/tests/ApplicationsPage.test.tsx) — `describe("ApplicationsPage")`, `it("affiche une erreur si le retrait est refusé au niveau métier")`, `it("signale une session expirée lors du retrait d'une candidature")`, `it("demande confirmation puis retire une candidature en cours")` | Couvert | Retrait et réouverture de candidature bien couverts. |
| R8 | Schéma, migrations et contraintes SQL | [backend/tests/db/migrations.test.ts](../../backend/tests/db/migrations.test.ts) — `describe("runMigrations")`, `it("crée toutes les tables sur une base vierge")`, `it("n'applique pas deux fois la même migration")`; [backend/tests/db/constraints.test.ts](../../backend/tests/db/constraints.test.ts) — `describe("offres")`, `describe("contacts et rattachements")`, `describe("candidatures et stages")`; [backend/tests/db/seed.test.ts](../../backend/tests/db/seed.test.ts) — `describe("volumes du seed")`, `describe("cas couverts par le seed")`, `describe("cohérence métier du seed")` | Couvert | Point fort du dépôt. |
| R9 | API active + erreurs JSON standard | [backend/tests/health.test.ts](../../backend/tests/health.test.ts) — `describe("GET /health")`, `it("indique que l'API fonctionne")`; `describe("route inconnue")`, `it("retourne une erreur 404 au format JSON commun")` | Couvert | API disponible et réponses JSON standardisées. |
| R10 | Session frontend + navigation + logout | [frontend/tests/App.test.tsx](../../frontend/tests/App.test.tsx) — `describe("App : session")`, `it("revient à la connexion quand l'utilisateur change de profil")`; [frontend/tests/NavBar.test.tsx](../../frontend/tests/NavBar.test.tsx) — `describe("NavBar")`, `it.each(...)`; [frontend/tests/HomePage.test.tsx](../../frontend/tests/HomePage.test.tsx) — `describe("HomePage")`, `it("accueille l'utilisateur et rappelle son profil et ses entreprises")` | Couvert | Parcours utilisateur et navigation validés. |
| R11 | États UI, chargement, erreur, vide | [frontend/tests/CompaniesPage.test.tsx](../../frontend/tests/CompaniesPage.test.tsx) — `it("affiche un état vide")`, `it("affiche une erreur si l'API répond en erreur")`; [frontend/tests/OffersPage.test.tsx](../../frontend/tests/OffersPage.test.tsx) — `it("affiche un refus d'accès renvoyé par le backend")`, `it("affiche une erreur métier lors du refus de candidature")`; [frontend/tests/ApplicationsPage.test.tsx](../../frontend/tests/ApplicationsPage.test.tsx) — `it("affiche l'état vide")`, `it("affiche une erreur si le retrait est refusé au niveau métier")`; [frontend/tests/HomePage.test.tsx](../../frontend/tests/HomePage.test.tsx) — `it("affiche une erreur si l'API répond en erreur")` | Couvert | État vide, erreur et gestion des messages robustes. |
| R12 | Type guards JSON | [frontend/tests/guards.test.ts](../../frontend/tests/guards.test.ts) — `describe("isHealth")`, `describe("isCompany")`, `describe("isCompanyList")`, `describe("isUser")`, `describe("isSession")`, `describe("isOffer")`; `it.each(...)` pour chaque type guard | Couvert | Validation runtime bien testée. |

---

## 5. État de couverture global

### 5.1. Couverture satisfaisante

Les points les mieux couverts sont :

- l’authentification démo et la sécurité session ;
- la logique de visibilité des entreprises et des offres selon le profil ;
- la création, l’historique et le retrait des candidatures ;
- les contraintes de base SQLite et la cohérence du seed ;
- les parcours front de login, session et navigation.

### 5.2. Couverture partielle

Un petit nombre de points sont seulement partiellement vérifiés par les tests actuels :

- les erreurs HTTP les plus détaillées sur chaque route ne sont pas toujours testées de façon exhaustive ;
- la validation des paramètres query/body côté API est bien couverte sur les cas principaux, mais pas de manière systématique sur chaque route ;
- l’absence de test E2E navigateur complet limite la validation de flux de bout en bout entre plusieurs écrans.

### 5.3. Éléments non couverts / non implémentés

Les fonctionnalités explicitement listées comme non implémentées dans [README.md](../../README.md) ne sont pas couvertes dans cette matrice car elles ne font pas partie du périmètre actuel. Cela inclut notamment :

- gestion complète des offres et de leur validation ;
- création de stages ;
- gestion des entreprises, contacts et doublons ;
- authentification réelle par email ;
- export Excel / conventions / années académiques.

---

## 6. Tests manquants à prioriser

### Priorité 1 — Risque fonctionnel et sécurité

Les quatre cas suivants ont été ajoutés et sont désormais couverts par les tests backend :

1. Validation de `offerId` invalide dans `POST /applications`.
   - Bloc ajouté : [backend/tests/applications.test.ts](../../backend/tests/applications.test.ts) — `it.each([...])("refuse %s avant la création de candidature (400)", ...)`
   - Impact : protection des requêtes côté API.

2. Rejet d’une route protégée avec jeton d’un compte désactivé après authentification.
   - Bloc ajouté : [backend/tests/auth.test.ts](../../backend/tests/auth.test.ts) — `it("refuse une route protégée quand le compte est désactivé après l'authentification")`
   - Impact : sécurité et cohérence de session.

3. Validation de la borne exacte de `q` sur `GET /companies`.
   - Bloc ajouté : [backend/tests/companies.test.ts](../../backend/tests/companies.test.ts) — `it("accepte une recherche de 100 caractères et refuse 101")`
   - Impact : robustesse des paramètres et protection de la requête.

4. Validation des valeurs vides / répétées pour `period` sur `GET /offers`.
   - Bloc ajouté : [backend/tests/offers.test.ts](../../backend/tests/offers.test.ts) — `it("accepte une absence de filtre de période et refuse les valeurs vides ou répétées")`
   - Impact : conformité des erreurs et robustesse métier.

### Priorité 2 — Règles métier critiques

5. Test de double candidature sur deux offres différentes pour le même étudiant.
   - Objectif : vérifier que la contrainte ne concerne qu’une seule offre à la fois, sans effet de bord sur d’autres candidatures.
   - Impact : logique métier de candidature multi-offres.

6. Test de retrait d’une candidature déjà `SELECTED`, `REJECTED` ou `WITHDRAWN` sur plusieurs profils.
   - Objectif : valider la couverture des cas 409 détaillés et les messages d’erreur métier.
   - Impact : cohérence du cycle de vie.

7. Test du cas “message vide, espace, null” lors de la création de candidature.
   - Objectif : confirmer la normalisation exacte de `message` côté API.
   - Impact : robustesse des services frontend/backend.

### Priorité 3 — Frontend / parcours utilisateur

8. Test du cas d’accès refusé sur une route protégée depuis l’interface, avec redirection vers la page de connexion.
   - Objectif : valider le comportement exact de `onUnauthorized` dans les pages non couvertes.
   - Impact : UX de session et sécurité front.

9. Test du cas où un contact sans rôle de déposant voit le menu des offres masqué mais peut toujours consulter les entreprises.
   - Objectif : vérifier la cohérence de navigation lors d’un profil spécialisé.
   - Impact : parcours utilisateur et rôle déduit.

10. Test de récupération de données frontend non valides, avec une réponse JSON incomplète ou structurée différemment.
   - Objectif : confirmer que les `type guards` bloquent les réponses inattendues sans plantage.
   - Impact : robustesse frontend et protection contre une API non fiable.

### Priorité 4 — Qualité de projet

11. Test E2E de navigation complète : connexion démo → accueil → entreprises → offres → candidatures → déconnexion.
   - Objectif : vérifier la continuité fonctionnelle entre écrans.
   - Impact : couverture de bout en bout.

12. Test de non-régression sur les séquences de migration et la base déjà initialisée.
   - Objectif : sécuriser les resets et les environnements de test.
   - Impact : stabilité de l’infrastructure de données.

---

## 7. Conclusion

Le projet Gesta affiche une bonne maturité de test fonctionnel sur les fonctionnalités actuellement implémentées :

- sécurité de session ;
- accès métier sur les entreprises et les offres ;
- création, historique et retrait des candidatures ;
- intégrité de la base SQLite ;
- parcours UI de connexion, navigation et gestion d’erreurs.

L’écart principal n’est pas dans la présence de tests, mais dans leur nature : ils sont surtout orientés “unité / intégration API / UI”, sans couverture E2E complète ni validation exhaustive des cas limites de requête. La prochaine étape logique est donc d’ajouter les tests de robustesse, de sécurité et de parcours de bout en bout, en priorisant les exigences critiques avant d’étendre le périmètre fonctionnel.
