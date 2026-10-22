# Bilan semaine 1 : découverte du projet et filtre par période

## Qu'ai-je appris ?
- Un agent ne se juge pas à son résumé final : Copilot annonçait « tout est réussi », mais je ne le savais vraiment qu'après avoir lancé `npm run check` moi-même (lint, typecheck, 110 tests backend et 47 tests frontend OK) et relu le code.
- Les permissions et la sandbox servent à garder la main sur l'agent : il ne peut ni accéder au réseau ni toucher à git sans mon accord.
- `/init` produit un fichier de règles (`AGENTS.md`) à relire et comparer au README et aux `package.json` avant de lui faire confiance.

## Qu'est-ce qui a bien fonctionné ?
- Une demande précise, qui reprenait les contraintes du sujet (filtre facultatif, visibilité inchangée, pas de dépendance ni de migration, erreur 400 pour une valeur inconnue, tests backend et frontend). Copilot a modifié 10 fichiers (+120 −15), sans migration et sans nouvelle dépendance.
- L'étape d'exploration avant de coder : la page `docs/parcours-affichage-offres.html` listait les fichiers concernés, ce qui m'a permis de limiter Copilot à ce périmètre.
- Le contrôle de ses affirmations : les 8 fichiers cités existent, les codes de période (P1, P2, OTHER) sont bien dans les données, et dans `offers.repository.ts` la condition sur la période s'ajoute aux règles de visibilité sans les remplacer.

## Qu'est-ce qui a moins bien fonctionné ?
- La sandbox bloquait souvent les tests, le lint et le typecheck. Copilot relançait les mêmes commandes avec d'autres options, ce qui m'a demandé beaucoup de confirmations « Allow Once ». J'ai gardé « Allow All » désactivé, comme demandé.
- `/init` a créé `AGENTS.md` et non `.github/copilot-instructions.md` comme annoncé dans le sujet.
- Au départ, `/sandbox policy` a été pris comme une question normale. Il fallait choisir la commande dans la liste.
- Difficultés de mise en place : `.vscode/settings.json` créé au mauvais niveau (dossier parent), et VS Code affichait d'abord « Copilot Free » alors que mon compte avait Copilot Student.

## Ce que j'ai vérifié ou corrigé moi-même
- Commandes d'`AGENTS.md` comparées au README et au `package.json` racine : elles étaient correctes.
- Chemins des fichiers cités par Copilot, codes de période, requête SQL du repository.
- `npm run check` lancé dans mon propre terminal, puis test manuel dans le navigateur.
- Le commit et le push ont été faits par moi, après relecture.

## Crédits IA consommés
- Plan : GitHub Copilot Student (quota de 200 crédits).
- Début de séance : 0 / 200. Après `/init` : 3. Après l'exploration : 7. Après la fonctionnalité : 11.
- Total consommé : **11 / 200** (valeur lue sur GitHub à la fin de la séance).