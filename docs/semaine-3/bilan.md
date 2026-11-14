# Bilan semaine 3 : guides/senseurs et matrice de traçabilité des tests

## Qu'ai-je appris ?
- **Distinction entre guides et senseurs** : un guide oriente l'agent et les développeurs avant/pendant l'écriture du code (`AGENTS.md`, `docs/architecture.md`, `backend/API.md`, règles `.oxlintrc.json`, typage TypeScript strict, schéma SQL), tandis qu'un senseur vérifie objectivement le résultat après coup (`npm run check`, suites de tests Vitest backend et frontend, type guards runtime, contraintes SQLite).
- **Traçabilité exigences ↔ tests** : relier explicitement chaque exigence (`R1` à `R12`) aux blocs `describe` et `it` réels permet de repérer les angles morts (comme les paramètres de requête mal formés ou les bornes limites) au lieu de se fier à une impression générale de couverture.
- **Pilotage précis de l'agent** : lorsqu'on demande une analyse documentaire à Copilot, il reste spontanément à un niveau macro (noms de fichiers). Il faut exiger les preuves exactes (chemins de fichiers, noms de scénarios de test, priorisation par risque) pour obtenir un livrable exploitable.

## Qu'est-ce qui a bien fonctionné ?
- **Découpage en trois étapes distinctes** dans GitHub Copilot (mode Agent) :
  1. Inventaire et classification des guides et senseurs par rapport aux bonnes pratiques Web 2 (`docs/semaine-3/matrice-guides-senseurs.md`).
  2. Cartographie des exigences `R1` à `R12` et des tests existants (`docs/semaine-3/matrice-tracabilite-tests.md`).
  3. Affinage des noms exacts des blocs de test, implémentation ciblée des 4 tests de priorité 1 et exécution de `npm run check`.
- **Contrôle des affirmations** : chaque fichier cité dans les deux matrices existe réellement dans le dépôt et correspond à l'architecture en couches (`controllers -> services -> repositories -> SQLite` côté backend, `pages -> hooks -> services/utils -> models` côté frontend).
- **Non-régression validée** : l'ajout des tests de priorité 1 (validation stricte d'`offerId`, rejet d'un compte désactivé après émission du token, bornes de longueur de recherche `q` sur `/companies`, paramètres `period` invalides ou répétés sur `/offers`) n'a cassé aucun existant.

## Qu'est-ce qui a moins bien fonctionné ?
- **Première version trop générique de la matrice de traçabilité** : Copilot avait initialement listé uniquement les fichiers (`backend/tests/applications.test.ts`, etc.) sans les intitulés précis des tests (`describe`/`it`) et avait glissé quelques anglicismes (« life cycle », « deduced »). J'ai dû le relancer pour affiner la matrice et corriger le français.
- **Blocage d'environnement Node.js** : la première tentative d'exécution de `npm run check` a échoué à cause d'une version locale de Node (`22.13.1`) trop ancienne par rapport au minimum requis (`22.14+` pour `better-sqlite3`). Il a fallu mettre à jour le runtime avant de relancer la validation.
- **Configuration Git / droits collaborateur** : l'envoi de la branche `semaine-3` a d'abord été bloqué (`403`) en attendant l'ajout de mon compte GitHub comme collaborateur sur le dépôt du groupe, et j'ai dû recréer une branche propre pour m'assurer que tout le travail soit tracé uniquement via GitHub Copilot.

## Ce que j'ai vérifié ou corrigé moi-même
- Relecture complète de `docs/semaine-3/matrice-guides-senseurs.md` et `docs/semaine-3/matrice-tracabilite-tests.md` : vérification de la cohérence entre les exigences `R1`–`R12`, les fichiers de tests cités et le périmètre réellement implémenté (sans inclure les fonctionnalités non développées du cahier des charges).
- Vérification du diff des tests ajoutés dans `backend/tests/` et de l'absence de modification non désirée sur le code métier ou les dépendances (`package.json`).
- Validation complète via `npm run check` :
  - **Backend** : 10 fichiers, **135 tests passés**.
  - **Frontend** : 8 fichiers, **57 tests passés**.
  - **Lint, typecheck et build** : OK.
- Export brut de l'intégralité de la conversation Copilot (`Copy All`) dans `docs/semaine-3/conversation-1.md`.

## Limites restantes identifiées par l'analyse
- Absence d'authentification réelle (mode démo local uniquement) et de mécanismes de sécurité avancés de production (rate limiting, headers CSP, logs structurés).
- Absence de workflow d'intégration continue (GitHub Actions) et de seuil de couverture de code imposé automatiquement.
- Absence de tests E2E dans un vrai navigateur (Playwright/Cypress) : la couverture repose uniquement sur Vitest (API/BDD/UI jsdom) et les vérifications manuelles.

## Crédits IA consommés
- **Plan** : GitHub Copilot Free (compte personnel connecté dans VS Code).
- **Consommation en fin de séance** : **0.3 %** des messages de chat (`Chat messages`) et **0 %** des suggestions en ligne (`Inline Suggestions`) — quota réinitialisé le 1er décembre 2026 à 01:00.