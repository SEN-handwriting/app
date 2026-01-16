# Sen — Learn the line

[![Status](https://img.shields.io/badge/status-in%20development-orange)](https://example.com)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen?logo=node.js)](https://nodejs.org/)
[![Package Manager](https://img.shields.io/badge/package--manager-bun-%234A4A4A?logo=bun)](https://bun.sh)
[![Turborepo](https://img.shields.io/badge/turborepo-uv-blue?logo=turbo)](https://turbo.build)
[![wakatime](https://wakatime.com/badge/user/14fe3c61-8f4f-4dd2-b75c-eff28a472911/project/e21ed498-5e36-4e2c-b0c5-b50bb0570af4.svg)](https://wakatime.com/badge/user/14fe3c61-8f4f-4dd2-b75c-eff28a472911/project/e21ed498-5e36-4e2c-b0c5-b50bb0570af4)

> 🎯 Objectif : créer une application mobile pour apprendre les langues de manière structurée (inspiration `Jisho.org` + méthodologie « NIHONGO »), avec écriture manuscrite, suivi de progression et immersion culturelle.

---

## Fiche d'identité

- **Nom du projet** : Sen — Learn the line
- **Équipe** :
  - Hugo DEMONT — UX / Dev / Chef de projet
  - Romain LEBLOND — UI / UX / Dev 
- **Chef de projet** : Hugo DEMONT
- **Coachs** :
  - Client : Labitte
  - Technique : Delcourte
- **Période** : 20/11/2025 → 05/06/2026
- **Soutenance** : 19/06/2026
- **Statut du dépôt** : privé / monorepo Turborepo

---

## Contexte

Notre projet est né d’une double inspiration : le dictionnaire `Jisho.org` et la méthodologie pédagogique du livre *NIHONGO — apprenez vos kana comme un japonais !* (Omaké Books).

Nous avons constaté que beaucoup d’outils permettent de consulter des kanjis, mais peu aident réellement à **apprendre à les écrire** de manière progressive, avec un suivi détaillé et de l’immersion contextuelle (dialogues authentiques). L’objectif est de répondre à ce besoin et de concevoir une solution extensible à d’autres langues.

---

## Fonctionnalités clés

- Apprentissage progressif de l’écriture (tracés / ordres de traits)
- Exercice d’écriture manuscrite (reconnaissance et correction)
- Suivi personnalisé de la progression (stats, répétition espacée)
- Immersion culturelle (dialogues et exemples authentiques)
- Extensibilité vers d’autres langues

---

## Arborescence principale (résumé)

- `apps/` — applications (ex. `web`, `server`)
- `packages/` — bibliothèques partagées (ex. `auth`, `database`, `ui`, configs)
- `utils/`, `validation/` — utilitaires et règles métier
- fichiers de configuration : `turbo.json`, `package.json`, `bun.lockb`, etc.

---

## Prérequis

- Node.js >= 18
- Bun 
- Git (pour cloner et gérer les branches)

---

## Démarrage rapide

Ouvrez un terminal à la racine du projet : `C:\wamp64\www\appsen`.

Option A — avec Bun (recommandé)

```powershell
cd C:\wamp64\www\appsen
bun install
bun run dev
```

Option B — avec npm

```powershell
cd C:\wamp64\www\appsen
npm install
npm run dev
```

Commandes utiles (racine du monorepo)

- `npm run dev` — lance `turbo dev` (ou `bun run dev`) pour démarrer tous les workspaces en mode développement
- `npm run build` — `turbo build` pour builder tous les packages/apps
- `npm run lint` — `turbo lint`
- `npm run format` — formate le code avec Prettier

Lancer une app individuellement (exemples)

```powershell
cd C:\wamp64\www\appsen\apps\web
npm run dev   # Next.js (ou bun run dev)

cd C:\wamp64\www\appsen\apps\server
npm run dev   # serveur (si le script existe)
```

---

## Tests et qualité

- TypeScript pour la vérification statique
- ESLint pour le linting
- Prettier pour le formatage

Ajoutez ici les badges CI / couverture / lint quand le pipeline sera en place.

---

## Liens utiles

- Turborepo : https://turbo.build
- Next.js : https://nextjs.org
- Bun : https://bun.sh
