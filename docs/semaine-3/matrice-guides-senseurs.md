# Matrice des guides et senseurs de Gesta

## 1. Objectif de la matrice

Cette matrice recense les éléments de gouvernance, de validation et de contrôle présents dans le dépôt, puis les compare aux bonnes pratiques de développement Web 2 : architecture en couches, validation des entrées, gestion des erreurs, sécurité, intégrité de la base, qualité du code et tests automatisés.

Le projet suit un modèle de travail en deux volets :

- un backend Express + SQLite, structuré par couches ;
- un frontend React + Vite, structuré par pages/hooks/services/utils.

Les principales références organisationnelles sont [AGENTS.md](../../AGENTS.md), [README.md](../../README.md), [docs/architecture.md](../architecture.md), [backend/API.md](../../backend/API.md), [docs/seed.md](../seed.md) et [docs/cdc_gesta_developpement.md](../cdc_gesta_developpement.md).

---

## 2. Inventaire des guides, conventions et règles

### 2.1. Guides d’architecture et de gestion du projet

| Type | Nom | Fichiers concernés | Rôle principal |
|---|---|---|---|
| Instructions projet | Guide agent | [AGENTS.md](../../AGENTS.md) | Définition du flux backend/frontend, règles métier, tests, environnement, sécurité et documentation. |
| Documentation de démarrage | README | [README.md](../../README.md) | Prérequis, commandes, choix techniques, commandes de contrôle, limitations et dépannage. |
| Architecture | Architecture du dépôt | [docs/architecture.md](../architecture.md) | Explication des couches backend/frontend, parcours de référence, tests et conventions. |
| API | Spécification API | [backend/API.md](../../backend/API.md) | Routes, formats JSON, codes d’erreur, contraintes fonctionnelles. |
| Données de démo | Données de seed | [docs/seed.md](../seed.md) | Identifiants stables, profils d’usage et procédure de reset de base. |
| Cahier des charges | CDC métier | [docs/cdc_gesta_developpement.md](../cdc_gesta_developpement.md) | Exigences fonctionnelles et principes métier. |
| Modèle d’édition | Template PR | [.github/pull_request_template.md](../../.github/pull_request_template.md) | Checklist de revue et de validation avant merge. |
| Paramétrage IDE | Paramètres VS Code | [.vscode/settings.json](../../.vscode/settings.json) | Règles de sécurité et autorisations d’outils dans l’agent local. |

### 2.2. Règles d’architecture concrètes dans le code

Le dépôt encode son architecture dans les fichiers de production :

- [backend/src/app.ts](../../backend/src/app.ts) : assembly des services, middlewares et routes.
- [backend/src/controllers](../../backend/src/controllers) : validation HTTP et conversion des entrées/sorties.
- [backend/src/services](../../backend/src/services) : règles métier, logique d’accès et filtres.
- [backend/src/repositories](../../backend/src/repositories) : accès SQL et requêtes SQLite.
- [backend/src/models](../../backend/src/models) : types métier et DTO.
- [backend/src/mappers](../../backend/src/mappers) : conversion DBO ↔ objet métier ↔ DTO.
- [backend/src/middlewares](../../backend/src/middlewares) : authentification, autorisation, gestion d’erreurs.
- [backend/src/utils](../../backend/src/utils) : erreurs HTTP et JWT.
- [frontend/src/App.tsx](../../frontend/src/App.tsx) : point d’entrée de la session et du routage.
- [frontend/src/hooks](../../frontend/src/hooks) : logique d’état, récupération des données et session.
- [frontend/src/services](../../frontend/src/services) : appels HTTP vers l’API.
- [frontend/src/utils](../../frontend/src/utils) : type guards, lecture JSON, stockage du token, libellés métier.

Les principes fondamentaux sont également explicités dans [AGENTS.md](../../AGENTS.md) :

- backend : contrôleurs → services → repositories → SQLite ;
- frontend : pages → hooks → services/utils → models ;
- séparation stricte des responsabilités ;
- pas de dépendance service → Request/Response Express ;
- règles de sécurité côté serveur relues en base à chaque requête.

### 2.3. Linters et validation de qualité

| Domaine | Fichiers | Objectif |
|---|---|---|
| Backend lint | [backend/.oxlintrc.json](../../backend/.oxlintrc.json) | Règles essentielles de TypeScript/Node, `no-unused-vars`, `no-explicit-any`, `eqeqeq`. |
| Frontend lint | [frontend/.oxlintrc.json](../../frontend/.oxlintrc.json) | Règles React hooks, dépendances de hooks, `no-explicit-any`, `eqeqeq`. |
| TypeScript backend | [backend/tsconfig.json](../../backend/tsconfig.json), [backend/tsconfig.build.json](../../backend/tsconfig.build.json) | Vérification stricte du code TS backend. |
| TypeScript frontend | [frontend/tsconfig.json](../../frontend/tsconfig.json), [frontend/tsconfig.app.json](../../frontend/tsconfig.app.json), [frontend/tsconfig.node.json](../../frontend/tsconfig.node.json) | Vérification stricte du code TS frontend et configuration Vite. |
| Node engine guard | [backend/src/nodeVersion.ts](../../backend/src/nodeVersion.ts), [backend/src/requireSupportedNode.ts](../../backend/src/requireSupportedNode.ts) | Bloque le démarrage si la version Node n’est pas compatible. |
| Scripts de contrôle | [package.json](../../package.json), [backend/package.json](../../backend/package.json), [frontend/package.json](../../frontend/package.json) | `lint`, `typecheck`, `test`, `build`, `check`, `db:init`, `db:reset`. |

### 2.4. Schémas, types stricts et contrôles de structure

| Catégorie | Fichiers | Point clé |
|---|---|---|
| Types de données | [backend/src/models](../../backend/src/models), [frontend/src/models](../../frontend/src/models) | Représentation des entités et états métier. |
| Type guards frontend | [frontend/src/utils/guards.ts](../../frontend/src/utils/guards.ts) | Validation du JSON renvoyé par l’API avant utilisation. |
| Types Express backend | [backend/src/types/express.ts](../../backend/src/types/express.ts) | Extension de `Request` avec `req.user`. |
| Validation des requêtes HTTP | [backend/src/controllers](../../backend/src/controllers) | Paramètres de route, paramètres query, corps JSON, gestion HTTP 400/401/403. |
| Sécurité session | [backend/src/utils/token.ts](../../backend/src/utils/token.ts), [backend/src/middlewares/authenticate.ts](../../backend/src/middlewares/authenticate.ts), [backend/src/services/auth.service.ts](../../backend/src/services/auth.service.ts) | JWT, vérification de session, lecture de l’utilisateur en base. |
| Règles d’accès | [backend/src/services/permissions.ts](../../backend/src/services/permissions.ts), [backend/src/middlewares/authorize.ts](../../backend/src/middlewares/authorize.ts) | Autorisation métier décorrélée d’Express. |
| Gestion des erreurs | [backend/src/utils/httpError.ts](../../backend/src/utils/httpError.ts), [backend/src/middlewares/errorHandler.ts](../../backend/src/middlewares/errorHandler.ts) | Format centralisé des erreurs JSON. |

### 2.5. Schéma de base de données et migrations

| Élément | Fichiers | Rôle |
|---|---|---|
| Base SQLite | [backend/src/db/database.ts](../../backend/src/db/database.ts) | Ouverture de connexion et activation de `foreign_keys`. |
| Migrations | [backend/src/db/migrations/001_initial.sql](../../backend/src/db/migrations/001_initial.sql), [backend/src/db/migrations/002_active_application_unique.sql](../../backend/src/db/migrations/002_active_application_unique.sql) | Schéma versionné, ordonné, non modifié après application. |
| Initialisation | [backend/src/db/initialize.ts](../../backend/src/db/initialize.ts), [backend/src/db/migrate.ts](../../backend/src/db/migrate.ts) | Création de la base et application des migrations. |
| Données de démonstration | [backend/src/db/seed](../../backend/src/db/seed) | Fichiers de seed (académie, entreprises, offres, personnes, etc.). |
| Scripts de maintenance | [backend/src/db/scripts/init.ts](../../backend/src/db/scripts/init.ts), [backend/src/db/scripts/reset.ts](../../backend/src/db/scripts/reset.ts), [backend/src/db/scripts/printSummary.ts](../../backend/src/db/scripts/printSummary.ts) | Initialisation, reset et synthèse de la base. |

---

## 3. Inventaire des senseurs de contrôle présents dans le dépôt

### 3.1. Senseurs de scripts de validation globale

Le dépôt met en place un système de garde-fou de qualité pour le projet entier :

- [package.json](../../package.json) : commandes racine `setup`, `dev`, `lint`, `typecheck`, `test`, `build`, `check`.
- [backend/package.json](../../backend/package.json) : `lint`, `typecheck`, `test`, `db:init`, `db:reset`, `build`.
- [frontend/package.json](../../frontend/package.json) : `lint`, `typecheck`, `test`, `build`.

Le point clé est la commande de contrôle globale :

- `npm run check` dans [package.json](../../package.json) = lint + typecheck + tests + build.

Cela constitue un senseur de qualité avant validation d’une livraison ou d’une PR.

### 3.2. Tests automatisés backend

Le backend dispose d’une batterie de tests Vitest + Supertest, dans [backend/tests](../../backend/tests) :

- [backend/tests/auth.test.ts](../../backend/tests/auth.test.ts) : authentification, tokens et accès public.
- [backend/tests/companies.test.ts](../../backend/tests/companies.test.ts) : liste/filtre d’entreprises.
- [backend/tests/offers.test.ts](../../backend/tests/offers.test.ts) : visibilité et droits selon profil.
- [backend/tests/applications.test.ts](../../backend/tests/applications.test.ts) : candidatures et règles métier.
- [backend/tests/health.test.ts](../../backend/tests/health.test.ts) : disponibilité de l’API.
- [backend/tests/permissions.test.ts](../../backend/tests/permissions.test.ts) : règles d’autorisation.
- [backend/tests/nodeVersion.test.ts](../../backend/tests/nodeVersion.test.ts) : compatibilité Node.
- [backend/tests/db/migrations.test.ts](../../backend/tests/db/migrations.test.ts) : migration et versionnement.
- [backend/tests/db/constraints.test.ts](../../backend/tests/db/constraints.test.ts) : contraintes SQL / intégrité.
- [backend/tests/db/seed.test.ts](../../backend/tests/db/seed.test.ts) : données de seed et cohérence.
- [backend/tests/helpers/testApp.ts](../../backend/tests/helpers/testApp.ts) : application de test sur SQLite mémoire.
- [backend/tests/helpers/testDatabase.ts](../../backend/tests/helpers/testDatabase.ts) : base SQLite isolée pour tests.

Un point important : les tests backend utilisent une base en mémoire et évitent la base locale de développement. C’est une bonne mesure de robustesse et d’isolation.

### 3.3. Tests automatisés frontend

Le frontend dispose d’une batterie de tests UI avec Vitest + Testing Library + jsdom :

- [frontend/tests/App.test.tsx](../../frontend/tests/App.test.tsx)
- [frontend/tests/LoginPage.test.tsx](../../frontend/tests/LoginPage.test.tsx)
- [frontend/tests/HomePage.test.tsx](../../frontend/tests/HomePage.test.tsx)
- [frontend/tests/CompaniesPage.test.tsx](../../frontend/tests/CompaniesPage.test.tsx)
- [frontend/tests/OffersPage.test.tsx](../../frontend/tests/OffersPage.test.tsx)
- [frontend/tests/ApplicationsPage.test.tsx](../../frontend/tests/ApplicationsPage.test.tsx)
- [frontend/tests/NavBar.test.tsx](../../frontend/tests/NavBar.test.tsx)
- [frontend/tests/guards.test.ts](../../frontend/tests/guards.test.ts)
- [frontend/tests/setup.ts](../../frontend/tests/setup.ts)
- [frontend/tests/helpers/fetchMock.ts](../../frontend/tests/helpers/fetchMock.ts)

Ils couvrent notamment :

- états de chargement ;
- états vide ;
- erreurs réseau ;
- session expirée / 401 ;
- comportements selon rôles.

### 3.4. Senseurs de validation API / BDD / intégrité

| Senseur | Fichiers | Nature |
|---|---|---|
| HTTP samples | [backend/http](../../backend/http) | Fichiers REST Client pour validations manuelles des routes. |
| Contrôle de structure JSON | [frontend/src/utils/guards.ts](../../frontend/src/utils/guards.ts), [frontend/src/services](../../frontend/src/services) | Détection des réponses inattendues. |
| Validation des erreurs | [backend/src/middlewares/errorHandler.ts](../../backend/src/middlewares/errorHandler.ts) | Merger les erreurs métier en réponse JSON standardisée. |
| Validation de propriétés liées à l’utilisateur | [backend/src/middlewares/authenticate.ts](../../backend/src/middlewares/authenticate.ts), [backend/src/middlewares/authorize.ts](../../backend/src/middlewares/authorize.ts) | 401/403 et lecture des rôles côté backend. |
| Validation métier par DB | [backend/tests/db/constraints.test.ts](../../backend/tests/db/constraints.test.ts), [backend/src/db/migrations](../../backend/src/db/migrations) | Ce qui est imposé par SQLite et par les contraintes SQL. |
| Seed + cohérence de données | [backend/src/db/seed](../../backend/src/db/seed), [backend/tests/db/seed.test.ts](../../backend/tests/db/seed.test.ts) | Vérification de la cohérence des données de démonstration. |

### 3.5. Senseurs de conformité technique

- [backend/src/nodeVersion.ts](../../backend/src/nodeVersion.ts) : compatibilité de version Node.
- [backend/src/requireSupportedNode.ts](../../backend/src/requireSupportedNode.ts) : blocage système au démarrage si la version est insuffisante.
- [backend/src/config.ts](../../backend/src/config.ts) : protection du mode démo, vérification de l’environnement de production.
- [backend/src/main.ts](../../backend/src/main.ts) : initialisation de la base, configuration de l’API.

---

## 4. Analyse des bonnes pratiques Web 2

### 4.1. Architecture en couches

| Bonnes pratiques | État | Preuves exactes |
|---|---|---|
| Séparation des responsabilités | Bien couvert | [docs/architecture.md](../architecture.md), [backend/src/app.ts](../../backend/src/app.ts), [backend/src/controllers](../../backend/src/controllers), [backend/src/services](../../backend/src/services), [backend/src/repositories](../../backend/src/repositories), [backend/src/mappers](../../backend/src/mappers) |
| Traversée cohérente de la requête | Bien couvert | [backend/src/app.ts](../../backend/src/app.ts), [backend/src/middlewares/authenticate.ts](../../backend/src/middlewares/authenticate.ts), [backend/src/middlewares/authorize.ts](../../backend/src/middlewares/authorize.ts) |
| Frontend orienté UI/état | Bien couvert | [frontend/src/App.tsx](../../frontend/src/App.tsx), [frontend/src/hooks](../../frontend/src/hooks), [frontend/src/services](../../frontend/src/services), [frontend/src/pages](../../frontend/src/pages) |
| Modèles/DTO distincts | Bien couvert | [backend/src/models](../../backend/src/models), [backend/src/mappers](../../backend/src/mappers), [frontend/src/models](../../frontend/src/models) |

Conclusion : la couche applicative est bien documentée et presque entièrement exprimée dans le code source.

### 4.2. Validation des entrées

| Bonnes pratiques | État | Preuves exactes |
|---|---|---|
| Validation HTTP côté backend | Bien couvert | [backend/src/controllers](../../backend/src/controllers) ; par exemple [backend/src/controllers/offers.controller.ts](../../backend/src/controllers/offers.controller.ts) et [backend/src/controllers/companies.controller.ts](../../backend/src/controllers/companies.controller.ts) |
| Validation des réponses JSON côté frontend | Bien couvert | [frontend/src/utils/guards.ts](../../frontend/src/utils/guards.ts), [frontend/src/utils/api.ts](../../frontend/src/utils/api.ts) |
| Données de types stricts | Bien couvert | [backend/tsconfig.json](../../backend/tsconfig.json), [frontend/tsconfig.json](../../frontend/tsconfig.json), [frontend/src/models](../../frontend/src/models) |
| Validation explicite des paramètres query / body | Partiellement couvert | Présent dans plusieurs contrôleurs, mais pas systématiquement généralisé dans tous les modules et pas via un schéma centralisé |

Conclusion : le projet va au-delà de la simple validation de type ; il valide explicitement les valeurs métier importantes. La limite est l’absence d’une bibliothèque de validation de schéma (Zod, Joi, Valibot, etc.) ou de validation centralisée unique.

### 4.3. Gestion des erreurs

| Bonnes pratiques | État | Preuves exactes |
|---|---|---|
| Erreurs métier standardisées | Bien couvert | [backend/src/utils/httpError.ts](../../backend/src/utils/httpError.ts), [backend/src/middlewares/errorHandler.ts](../../backend/src/middlewares/errorHandler.ts) |
| Codes HTTP explicites | Bien couvert | [backend/API.md](../../backend/API.md), [backend/src/middlewares/errorHandler.ts](../../backend/src/middlewares/errorHandler.ts) |
| Frontend: map des erreurs HTTP | Bien couvert | [frontend/src/utils/api.ts](../../frontend/src/utils/api.ts), [frontend/src/hooks/useAuth.ts](../../frontend/src/hooks/useAuth.ts) |
| Gestion des 404/5xx | Bien couvert | [backend/src/middlewares/errorHandler.ts](../../backend/src/middlewares/errorHandler.ts) |
| Journalisation d’erreurs | Partiellement couvert | Le middleware affiche `console.error(err)` ; ce n’est pas un système de logs structuré/prod |

Conclusion : la gestion des erreurs est solide au niveau applicatif, mais pas encore instrumentée pour la production (logs centralisés, traces, métriques).

### 4.4. Sécurité et accès

| Bonnes pratiques | État | Preuves exactes |
|---|---|---|
| Authentification par JWT | Bien couvert | [backend/src/services/auth.service.ts](../../backend/src/services/auth.service.ts), [backend/src/utils/token.ts](../../backend/src/utils/token.ts) |
| Rechargement des droits en base à chaque requête | Bien couvert | [docs/architecture.md](../architecture.md), [backend/src/middlewares/authenticate.ts](../../backend/src/middlewares/authenticate.ts) |
| Autorisation métier côté serveur | Bien couvert | [backend/src/services/permissions.ts](../../backend/src/services/permissions.ts), [backend/src/middlewares/authorize.ts](../../backend/src/middlewares/authorize.ts) |
| Sécurité des sessions | Partiellement couvert | Le mécanisme est correct pour un projet de démonstration, mais le mode démo n’est pas une vraie authentification |
| Protection contre la production avec mode démo | Bien couvert | [backend/src/config.ts](../../backend/src/config.ts), [README.md](../../README.md) |
| Gestion des rôles et des entreprises | Bien couvert | [backend/src/repositories/users.repository.ts](../../backend/src/repositories/users.repository.ts), [backend/src/models/user.ts](../../backend/src/models/user.ts) |

Conclusion : la sécurité de base est présente et bien pensée, mais elle reste limitée à un modèle de démonstration local. Il manque une authentification réelle et un hardening plus avancé (ratelimiting, CSP, headers de sécurité, validation avancée des entrées, protections CSRF selon contexte).

### 4.5. Intégrité de la base de données

| Bonnes pratiques | État | Preuves exactes |
|---|---|---|
| Migrations versionnées | Bien couvert | [backend/src/db/migrations](../../backend/src/db/migrations), [docs/architecture.md](../architecture.md) |
| Clés étrangères activées | Bien couvert | [backend/src/db/database.ts](../../backend/src/db/database.ts) |
| Contraintes SQL | Bien couvert | [backend/src/db/migrations/001_initial.sql](../../backend/src/db/migrations/001_initial.sql), [backend/tests/db/constraints.test.ts](../../backend/tests/db/constraints.test.ts) |
| Tests de cohérence de données | Bien couvert | [backend/tests/db/seed.test.ts](../../backend/tests/db/seed.test.ts) |
| Séparation métier / contraintes | Bien couvert | [docs/architecture.md](../architecture.md) et commentaires dans les migrations |

Conclusion : c’est un des points les plus solides du dépôt. La base est structurée, versionnée et validée par tests.

### 4.6. Qualité du code et maintenabilité

| Bonnes pratiques | État | Preuves exactes |
|---|---|---|
| Lint statique | Bien couvert | [backend/.oxlintrc.json](../../backend/.oxlintrc.json), [frontend/.oxlintrc.json](../../frontend/.oxlintrc.json), [backend/package.json](../../backend/package.json), [frontend/package.json](../../frontend/package.json) |
| TypeScript strict | Bien couvert | [backend/tsconfig.json](../../backend/tsconfig.json), [frontend/tsconfig.json](../../frontend/tsconfig.json) |
| Tests unitaires | Bien couvert | [backend/tests](../../backend/tests), [frontend/tests](../../frontend/tests) |
| Tests d’intégration backend | Bien couvert | [backend/tests](../../backend/tests) avec `createTestApp` et base SQLite mémoire |
| Tests UI frontend | Bien couvert | [frontend/tests](../../frontend/tests) |
| Couverture de test explicite | Partiellement couvert | Pas de rapport de couverture ; pas de seuil de couverture consolidé dans la config |
| CI de validation automatique | Manquant | Il n’y a ni workflow GitHub Actions ni hook de CI défini dans le dépôt actuel |

Conclusion : la qualité du code est perceptible, mais la couverture de tests n’est pas mesurée ni imposed par seuil explicite.

### 4.7. Tests unitaires et d’intégration

| Domaine | État | Observations |
|---|---|---|
| Tests backend API | Bien couvert | Auth, companies, offers, applications, permissions, health. |
| Tests BDD / données / contraintes SQL | Bien couvert | Migrations, constraints, seed. |
| Tests frontend UI | Bien couvert | Navigation, session, pages, états d’erreur/chargement. |
| Test E2E navigateur réel | Manquant | Pas de Playwright/Cypress ni scénario de test navigateur complet. |
| Test de régression métier complet | Partiellement couvert | Le dépôt couvre de nombreuses règles, mais il n’existe pas de suite E2E finale de bout en bout de l’application. |

---

## 5. Ce qui est déjà bien couvert

Les points les mieux couverts dans le dépôt, avec preuves exactes, sont les suivants :

1. Architecture en couches et flux de données
   - [docs/architecture.md](../architecture.md)
   - [backend/src/app.ts](../../backend/src/app.ts)
   - [frontend/src/App.tsx](../../frontend/src/App.tsx)

2. Validation des entrées métier et transport
   - [backend/src/controllers](../../backend/src/controllers)
   - [frontend/src/utils/guards.ts](../../frontend/src/utils/guards.ts)
   - [frontend/src/utils/api.ts](../../frontend/src/utils/api.ts)

3. Sécurité côté serveur et autorisations
   - [backend/src/middlewares/authenticate.ts](../../backend/src/middlewares/authenticate.ts)
   - [backend/src/middlewares/authorize.ts](../../backend/src/middlewares/authorize.ts)
   - [backend/src/services/permissions.ts](../../backend/src/services/permissions.ts)
   - [backend/src/services/auth.service.ts](../../backend/src/services/auth.service.ts)

4. Gestion centralisée des erreurs
   - [backend/src/utils/httpError.ts](../../backend/src/utils/httpError.ts)
   - [backend/src/middlewares/errorHandler.ts](../../backend/src/middlewares/errorHandler.ts)

5. Intégrité de la base et migrations
   - [backend/src/db/database.ts](../../backend/src/db/database.ts)
   - [backend/src/db/migrations](../../backend/src/db/migrations)
   - [backend/tests/db/constraints.test.ts](../../backend/tests/db/constraints.test.ts)

6. Qualité de code et validation automatique
   - [backend/.oxlintrc.json](../../backend/.oxlintrc.json)
   - [frontend/.oxlintrc.json](../../frontend/.oxlintrc.json)
   - [package.json](../../package.json)
   - [backend/tsconfig.json](../../backend/tsconfig.json)
   - [frontend/tsconfig.json](../../frontend/tsconfig.json)

7. Tests unitaires et d’intégration backend + frontend
   - [backend/tests](../../backend/tests)
   - [frontend/tests](../../frontend/tests)

---

## 6. Ce qui est partiellement couvert ou manquant

### 6.1. Authentification réelle non implémentée

Le dépôt est explicite sur le fait que le mode démo est local uniquement :

- [README.md](../../README.md)
- [backend/API.md](../../backend/API.md)
- [backend/src/config.ts](../../backend/src/config.ts)

Le défaut majeur est qu’on n’a pas de vraie auth (email magique, mot de passe, session sécurisée, refresh token, etc.). Cela limite les bonnes pratiques de production et l’orientation sécurité Web 2.

### 6.2. Absence de surveillance de production / logs structurés

Le système passe par `console.error`, mais il n’existe ni:

- logs structurés ;
- tracer/request-id ;
- monitoring applicatif ;
- alerting ;
- report de santé centralisé.

### 6.3. Pas de workflow CI explicite dans le dépôt

Le dépôt comporte un template PR mais pas de workflow GitHub Actions ni de CI automatisée dans [.github](../../.github). Cela réduit l’assurance de reproductibilité entre machines.

### 6.4. Pas de couverture de test reportée ou seuil imposé

Les tests existent, mais le dépôt ne définit pas :

- seuil de couverture ;
- rapport HTML/LCOV ;
- barrière de qualité au merge.

### 6.5. Aucun test E2E navigateur réel

Le dépôt couvre les pages et les hooks via tests UI, mais pas de vraie validation navigateur de bout en bout avec Playwright/Cypress. Cela laisse une marge sur les interactions de navigation, layout et intégration navigateur réelle.

### 6.6. Validation des entrées moins forte que les outils de production

Les contrôleurs et les type guards sont présents, mais le dépôt n’utilise pas encore un schéma de validation centralisée; on est encore dans une logique manuelle. Cela est acceptable pédagogiquement, mais plus limité pour les grands projets.

### 6.7. Sécurité avancée non mise en place

Pour un projet de production, on manque encore généralement de :

- rate limiting ;
- headers de sécurité HTTP ;
- policy CSP ;
- anti-CSRF selon contexte ;
- gestion plus robuste des secrets ;
- audit d’accès et logs d’activité.

---

## 7. Synthèse

Le dépôt Gesta est globalement bien structuré et conforme aux bonnes pratiques de développement Web 2 sur les points suivants :

- architecture applicative claire ;
- séparation backend/frontend ;
- validation côté backend et frontend ;
- gestion centralisée des erreurs ;
- contrôle des accès et rôles côté serveur ;
- intégrité de la base par migrations + contraintes SQL ;
- tests automatisés backend/frontend de qualité.

Les principales lacunes concernent surtout la maturité “production” :

- auth réelle absente ;
- pas de CI ;
- pas de couverture mesurée ;
- pas de test E2E réel ;
- pas de hardening de sécurité avancé.

En somme, l’architecture et les garde-fous techniques sont déjà solides, mais la couche “production-grade security / automation / observability” est encore incomplète.
