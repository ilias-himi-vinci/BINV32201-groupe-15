# Cas de tests manuels (end-to-end) : candidatures

Préparation : `npm run db:reset` puis `npm run dev`, ouvrir le frontend dans le navigateur.
Comptes : connexions de démonstration (étudiants, et un compte contact ou admin).

| # | Scénario | Étapes | Résultat attendu | Résultat observé |
|---|---|---|---|---|
| 1 | Candidature avec message | Étudiant > liste des offres > « Candidater » > saisir un message > valider | Candidature créée, statut « En cours » | Conforme |
| 2 | Candidature sans message | Même chose, message laissé vide | Candidature créée, statut « En cours » | Conforme |
| 3 | Doublon | Candidater une 2e fois à une offre déjà « En cours » | Erreur métier, pas de 2e candidature | Conforme |
| 4 | Persistance | Recharger la page « Mes candidatures » | Candidatures et statuts toujours présents | Conforme |
| 5 | Retrait | « Mes candidatures » > « Retirer » sur une candidature « En cours » > confirmer | Statut « Retirée » (aussi après rechargement) | Conforme |
| 6 | Candidature traitée | Regarder une candidature « Retenue » ou « Non retenue » | Pas de bouton « Retirer » ; le serveur refuse le retrait | Conforme |
| 7 | Re-candidature après retrait | Candidater de nouveau à l'offre retirée | Nouvelle candidature « En cours », l'ancienne reste « Retirée » | Conforme |
| 8 | Séparation des étudiants | Comparer « Mes candidatures » de deux étudiants | Chacun ne voit que les siennes | Conforme |
| 9 | Autre rôle | Se connecter en contact ou admin | Pas de bouton « Candidater », pas de lien « Mes candidatures », refus côté serveur | Conforme |
| 10 | Offre non publiée | Candidater à une offre non publiée | Refus côté serveur (non atteignable dans l'interface) | Vérifié par les tests automatiques |