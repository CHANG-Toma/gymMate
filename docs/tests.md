# Tests fonctionnels GymMate (J10)

Dernière exécution : **24/11/2026** — `npm run test:firebase` → **12/12 OK**  
Projet Firebase : `gymmate-ebd11`

| ID | Scénario | Observé | Status |
|----|----------|---------|--------|
| T01 | Compte + redémarrage | uid A stable, profil 2× | **OK** |
| T02 | Passage A → B | Profils isolés | **OK** |
| T03 | Membres salle | A voit B, pas C | **OK** |
| T04 | Demande + double appui | 1 doc | **OK** |
| T05 | Demandes interdites | 3 refus règles | **OK** |
| T06 | Refus | status=rejected, pas de séance | **OK** |
| T07 | Acceptation | relation + chat + séance | **OK** |
| T08 | 2ᵉ séance | même pairId, 2 séances | **OK** |
| T09 | Messages A/B | messages échangés | **OK** |
| T10 | Accès C | écriture/lecture refusées | **OK** |
| T11 | Écriture forgée | refusés | **OK** |
| T12 | Reprise sans doublon | id stable → 1 doc | **OK** |

## Comptes

| | Email | Mot de passe |
|--|-------|--------------|
| A | `lina@gymmate.test` | `Test1234!` |
| B | `sami@gymmate.test` | `Test1234!` |
| C | `nora@gymmate.test` | `Test1234!` |

```bash
npm run test:firebase
```
