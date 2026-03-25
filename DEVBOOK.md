# DEVBOOK — Sen: Learn the Line

> Guide de développement complet du projet Sen.
> Dernière mise à jour: 25/03/2026

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Setup & environnement](#2-setup--environnement)
3. [Architecture monorepo](#3-architecture-monorepo)
4. [Applications](#4-applications)
5. [Packages partagés](#5-packages-partagés)
6. [Base de données](#6-base-de-données)
7. [Authentification](#7-authentification)
8. [Système de validation de traits](#8-système-de-validation-de-traits)
9. [Données des caractères](#9-données-des-caractères)
10. [API Reference](#10-api-reference)
11. [Flows utilisateur](#11-flows-utilisateur)
12. [Conventions de code](#12-conventions-de-code)
13. [Scripts utiles](#13-scripts-utiles)
14. [Roadmap & backlog](#14-roadmap--backlog)

---

## 1. Vue d'ensemble

**Sen** est une application web mobile-first d'apprentissage de l'écriture de systèmes d'écriture étrangers (Hiragana japonais, Cyrillique russe). L'utilisateur apprend à tracer les caractères dans le bon ordre grâce à un système de validation de traits en temps réel.

### Contexte projet
| Champ | Valeur |
|---|---|
| Équipe | Hugo DEMONT + Romain LEBLOND |
| Durée | 20/11/2025 → 05/06/2026 |
| Soutenance | 19/06/2026 |
| Repo | `C:\wamp64\www\appsen` |
| Branche principale | `master` |
| Branche active | `features/proto-canvas` |

### Langues supportées
| Code | Langue | Script | Caractères |
|---|---|---|---|
| `japanese` | Japonais | Hiragana | あいうえお + ... (KanjiVG) |
| `russian` | Russe | Cyrillique | А О У Э Ы И + consonnes |

---

## 2. Setup & environnement

### Prérequis
- **Bun** ≥ 1.1.38 (package manager + runtime)
- **Node.js** ≥ 18 (pour compatibilité outils)
- **Git**

### Installation

```bash
# Cloner & installer
git clone <repo>
cd appsen
bun install

# Préparer la base de données
cd packages/database
bun run db:push        # Applique le schéma Prisma
bun run db:seed        # (optionnel) données de test

# Lancer le projet complet
cd ../..
bun run dev            # Lance web + server en parallèle via Turborepo
```

### Variables d'environnement

**`apps/server/.env`**
```env
DATABASE_URL=file:../../packages/database/prisma/dev.db
BETTER_AUTH_SECRET=<secret_32_chars_minimum>
WEBAPP_URL=http://localhost:3001
COOKIE_DOMAIN=localhost
```

**`apps/web/.env.local`**
```env
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

### Ports par défaut
| App | Port | Commande |
|---|---|---|
| `apps/web` | 3001 | `next dev --port=3001` |
| `apps/server` | 3000 | `bun --watch ./src/index.ts` |

---

## 3. Architecture monorepo

```
appsen/
├── apps/
│   ├── web/          → Next.js 15 (App Router) — Frontend
│   └── server/       → Hono + Bun — API Backend
├── packages/
│   ├── auth/         → Better-Auth config (server + client)
│   ├── database/     → Prisma schema + client SQLite
│   ├── ui/           → Composants Radix UI partagés
│   ├── utils/        → Utilitaires partagés (à étoffer)
│   ├── validation/   → Schémas Valibot (auth)
│   ├── eslint-config/
│   ├── prettier-config/
│   ├── tailwind-config/
│   └── typescript-config/
├── scripts/
│   └── fetch-kanjivg.js    → Script de récupération de paths SVG KanjiVG
├── turbo.json
├── package.json
└── bun.lockb
```

### Turborepo — tâches définies

| Tâche | Cache | Description |
|---|---|---|
| `build` | ✓ | Build toutes les apps/packages |
| `dev` | ✗ | Dev mode en parallèle |
| `lint` | ✓ | ESLint sur tout |
| `check-types` | ✓ | TypeScript check |

---

## 4. Applications

### `apps/web` — Frontend Next.js

**Stack**: Next.js 15 + React 19 + Tailwind CSS v4 + Zustand + TanStack Query

#### Structure des pages (App Router)

```
src/app/
├── layout.tsx                        → Root layout (providers)
├── page.tsx                          → Accueil — sélection de langue
├── (auth)/
│   ├── sign-in/page.tsx              → Connexion
│   └── sign-up/page.tsx              → Inscription
├── langue/
│   ├── page.tsx                      → Liste des langues
│   └── [lang]/
│       ├── page.tsx                  → Cours disponibles pour une langue
│       └── [course]/
│           └── learn/page.tsx        → Page d'apprentissage interactive
├── course/page.tsx                   → Vue d'ensemble des cours
└── api/
    ├── characters/route.ts           → GET /api/characters
    └── kanjivg/[char]/route.ts       → GET /api/kanjivg/[char]
```

#### Composants clés

**`DrawCanvas.tsx`** — Canvas de dessin
- Écoute les pointer events (souris + tactile)
- Enregistre les traits comme tableaux `{x, y}[]`
- Affiche les guides SVG (grille)
- Expose via `useImperativeHandle`: `clear()` + `getImageData()`
- Callback `onStrokeComplete(points)` à chaque trait terminé

**`CharacterPreview.tsx`** — Aperçu animé du caractère
- Rendu SVG des paths du caractère
- Animation trait par trait (1s par trait)
- Intégration Web Speech API pour la prononciation
- Contrôles: replay, lecture audio

**`PracticeGrid.tsx`** — Grille de pratique (composant central)
- **3 niveaux de difficulté**:
  - Niveau 1: guide complet (trait en surimpression)
  - Niveau 2: guide pointillé
  - Niveau 3: grille vide
- Validation en temps réel de chaque trait
- Feedback visuel: bordure rouge/bleu/verte
- Suivi des tentatives et score (0-100)
- Indicateurs succès/échec (check/X)

**`LearnClient.tsx`** — Coordination côté client
- Orchestre CharacterPreview + PracticeGrid
- Gère la progression entre les caractères

#### Hooks personnalisés

| Hook | Fichier | Usage |
|---|---|---|
| `useCharacters(lang?)` | `hooks/` | Fetch liste de caractères via React Query |
| `useCharacter(id)` | `hooks/` | Fetch un caractère par ID |
| `useCopy` | `hooks/` | Copier dans le presse-papier |
| `useDebounce` | `hooks/` | Debounce une valeur |
| `useToggle` | `hooks/` | Toggle boolean |

---

### `apps/server` — Backend Hono

**Stack**: Hono 4 + Bun + Better-Auth + Prisma

#### Routes

```
GET  /                    → Health check ("Hello!")
POST /api/auth/*          → Better-Auth handler
GET  /api/auth/*          → Better-Auth handler
GET  /users/me            → Utilisateur courant (skeleton)
```

#### Configuration

- CORS configuré via `WEBAPP_URL`
- Cookies subdomain via `COOKIE_DOMAIN`
- Stateless (toute persistence via Prisma)

---

## 5. Packages partagés

### `@repo/auth`

**Exports**:
- `@repo/auth/server` → instance Better-Auth (backend)
- `@repo/auth/client` → client Better-Auth (browser)

**Auth methods activées**: email/password

**Générer le schéma Prisma depuis Better-Auth**:
```bash
cd packages/auth
bun run generate
# → Met à jour packages/database/prisma/schema.prisma
```

---

### `@repo/database`

**Exports**:
- `@repo/database/client` → instance Prisma client

**Scripts**:
```bash
bun run db:generate    # Génère les types Prisma
bun run db:push        # Applique le schéma (dev)
bun run db:seed        # Seed données
bun run db:studio      # Ouvre Prisma Studio (UI)
bun run db:validate    # Valide le schéma
```

---

### `@repo/ui`

Composants partagés basés sur Radix UI + Tailwind:

| Composant | Description |
|---|---|
| `Button` | Bouton avec variantes |
| `Input` | Champ de saisie |
| `Form` | Wrapper React Hook Form |
| `Dialog` | Modal/Dialog |
| `Tabs` | Navigation par onglets |
| `Select` | Menu déroulant |
| `Badge` | Badge/étiquette |
| `Avatar` | Avatar utilisateur |
| `Switch` | Toggle switch |
| `Slider` | Curseur |
| `Tooltip` | Info-bulle |
| `Command` | Palette de commandes (cmdk) |

**Import**: `import { Button } from "@repo/ui/components/button"`

---

### `@repo/validation`

Schémas Valibot pour les formulaires d'auth:

| Export | Fichier | Usage |
|---|---|---|
| email schema | `auth/email.ts` | Validation email |
| password schema | `auth/password.ts` | Validation mot de passe |
| username schema | `auth/username.ts` | Validation pseudo |
| sign-in schema | `auth/sign-in.ts` | Formulaire connexion |
| sign-up schema | `auth/sign-up.ts` | Formulaire inscription |

---

## 6. Base de données

### Schéma Prisma (SQLite)

```prisma
// ─── Auth (better-auth) ──────────────────────────────────────
model User { id, name, email, sessions[], accounts[], userStats[], progress[], sessions2[] }
model Session { id, token, userId, expiresAt }
model Account { ... }       // OAuth / credentials
model Verification { ... }  // Email verification tokens

// ─── Contenu ─────────────────────────────────────────────────
model Language { id, code, name, script, characters[], courses[] }
model Course    { id, languageId, level, title, characters[] }
model Character { id, label, audioText, svgPaths(JSON), strokeCount, ... }

// ─── Progression (SM-2) ──────────────────────────────────────
model UserProgress {
  // repetitions, easeFactor, interval (SM-2)
  // practiceLevel 0→1→2
  // successCount, failCount, nextReview
}
model PracticeSession { id, userId, languageId, startedAt, score, attempts[] }
model StrokeAttempt   { id, sessionId, characterId, score, feedback(JSON), isSuccess }
model UserStats       { id, userId, key, value }  // Stats agrégées clé/valeur
```

> **Important**: Le schéma DB est complet. Il reste à brancher le seed script (`characters.ts` → DB) et à implémenter les routes API côté serveur.

### État des modèles
| Modèle | Schéma | Routes API | Frontend |
|---|---|---|---|
| User / Session / Account | ✅ | ✅ Better-Auth | ✅ |
| Language | ✅ | ❌ | ❌ |
| Course | ✅ | ❌ | ❌ |
| Character | ✅ | ⚠️ fichier statique | ⚠️ |
| UserProgress | ✅ | ❌ | ❌ |
| PracticeSession | ✅ | ❌ | ❌ |
| StrokeAttempt | ✅ | ❌ | ❌ |
| UserStats | ✅ | ❌ | ❌ |

---

## 7. Authentification

**Provider**: Better-Auth v1.3

**Flow standard**:
1. Formulaire sign-up/sign-in dans `apps/web/src/app/(auth)/`
2. Soumission → `@repo/auth/client` → requête `apps/server` → Better-Auth handler
3. Cookie de session créé (HttpOnly)
4. Session accessible via `auth.getSession()` côté serveur

**Utilisation côté server component**:
```typescript
import { auth } from "@repo/auth/server"
const session = await auth.getSession(request)
if (!session) redirect("/sign-in")
```

**Utilisation côté client**:
```typescript
import { authClient } from "@repo/auth/client"
const { data: session } = authClient.useSession()
```

---

## 8. Système de validation de traits

> Fichier: `apps/web/src/lib/stroke-validator.ts`

### Vue d'ensemble

Le moteur de validation compare le trait dessiné par l'utilisateur avec le trait de référence (SVG path KanjiVG).

### Pipeline de validation

```
SVG Path string
    ↓
parseSvgPath()          → Points absolus dense (cubiques Bezier échantillonnés)
    ↓
normalizePoints()        → Mise à l'échelle 109x109 → 300x300 (canvas)
    ↓
simplifyStroke()         → Réduction Douglas-Peucker (tolérance = 2)
    ↓
validateStroke(user, ref) → Score 0-100
    ├── coverageScore (70%) → distance point-à-point < 55px
    └── directionScore (30%) → dot product vecteur global ≥ 0
```

### Paramètres critiques

| Paramètre | Valeur | Description |
|---|---|---|
| SVG viewBox | `109x109` | Standard KanjiVG |
| Canvas size | `300x300` | Résolution canvas |
| Coverage tolerance | `55px` | Distance max point→référence |
| Coverage min | `45%` | % points couverts minimum |
| Direction min | `50%` | Score direction minimum |
| Overall pass | `≥52%` | Score global pour valider |
| Coverage weight | `70%` | Poids couverture dans score |
| Direction weight | `30%` | Poids direction dans score |

### Ajouter un nouveau caractère japonais

```bash
# Récupérer les SVG paths depuis KanjiVG
node scripts/fetch-kanjivg.js <caractère>
# Ex: node scripts/fetch-kanjivg.js か

# Ajouter le résultat dans apps/web/src/data/characters.ts
```

### Ajouter un caractère Cyrillique

Les paths sont dessinés manuellement avec un viewBox `109x109`. Pattern:

```typescript
{
  id: "cyrillic-б",
  label: "Б",
  lang: "russian",
  audioText: "б",
  svgPaths: [
    "M 20,20 L 89,20",     // Trait 1: ligne horizontale
    "M 20,20 L 20,89",     // Trait 2: descente verticale
    // ...
  ],
  strokeCount: 3,
  meanings: ["B sound"],
  courseLevel: 1,
}
```

---

## 9. Données des caractères

> Fichier: `apps/web/src/data/characters.ts`

### Interface `Character`

```typescript
interface Character {
  id: string;              // Ex: "hiragana-あ", "cyrillic-А"
  label: string;           // Caractère affiché
  lang: string;            // "japanese" | "russian"
  audioText: string;       // Texte pour Web Speech API
  svgPaths: string[];      // Paths SVG (viewBox 109x109)
  strokeCount?: number;    // Nombre de traits
  meanings?: string[];     // Significations
  romaji?: string[];       // Romanisation
  readings?: {
    kana?: string[];
    onyomi?: string[];
    kunyomi?: string[];
  };
  jlpt?: string;           // "N5" | "N4" | ...
  courseLevel: number;     // 1, 2, 3... (groupe dans les cours)
}
```

### État actuel des données

| Langue | Caractères | Niveaux |
|---|---|---|
| Japonais (Hiragana) | あ い う え お (+ à compléter) | 1 |
| Russe (Cyrillique) | А О У Э Ы И Е Ё Ю Я Й + consonnes | 1 |

---

## 10. API Reference

### Frontend Next.js API Routes

#### `GET /api/characters`

Retourne les caractères filtrés.

**Query params**:
| Param | Type | Description |
|---|---|---|
| `lang` | string | Filtrer par langue (`japanese`, `russian`) |
| `level` | number | Filtrer par `courseLevel` |
| `id` | string | Récupérer un caractère spécifique |

**Réponse**:
```json
[
  {
    "id": "hiragana-あ",
    "label": "あ",
    "lang": "japanese",
    "svgPaths": ["M 54.5,17 C ...", "..."],
    "strokeCount": 3,
    "courseLevel": 1
  }
]
```

---

#### `GET /api/kanjivg/[char]`

Récupère les paths SVG depuis KanjiVG GitHub (cache serveur 24h).

**Paramètre**: `char` — caractère URL-encodé (ex: `%E3%81%82` pour `あ`)

**Réponse**:
```json
{
  "paths": ["M 54.5,17 ...", "M 68.5,28 ...", "M 14,46 ..."],
  "strokeCount": 3
}
```

---

### Backend Server Routes

#### `GET /users/me` *(skeleton)*

Retourne les infos de l'utilisateur courant.

**Headers**: Cookie de session requis

**Réponse prévue**:
```json
{
  "id": "...",
  "name": "...",
  "email": "..."
}
```

---

## 11. Flows utilisateur

### Flow d'apprentissage (core loop)

```
Accueil (/)
    ↓ Choisir une langue
/langue/[lang]
    ↓ Choisir un cours (courseLevel)
/langue/[lang]/[course]/learn
    ↓
┌─────────────────────────────────┐
│  CharacterPreview               │
│  → Anime les traits du caract.  │
│  → Prononciation audio          │
└─────────────────────────────────┘
    ↓ L'utilisateur est prêt
┌─────────────────────────────────┐
│  PracticeGrid                   │
│  Niveau 1: guide complet        │
│  → L'utilisateur trace          │
│  → Validation en temps réel     │
│  → ✓ Passe au niveau suivant    │
│                                  │
│  Niveau 2: guide pointillé      │
│  Niveau 3: grille vide          │
└─────────────────────────────────┘
    ↓ Caractère maîtrisé
Caractère suivant (ou fin du cours)
```

### Flow d'authentification

```
Sign-up: email + password → POST /api/auth/sign-up/email
Sign-in: email + password → POST /api/auth/sign-in/email
Sign-out:                  → POST /api/auth/sign-out
Session:                   → GET  /api/auth/get-session
```

---

## 12. Conventions de code

### Nommage des fichiers

| Type | Convention | Exemple |
|---|---|---|
| Composants React | PascalCase | `PracticeGrid.tsx` |
| Hooks | camelCase + `use` | `useCharacters.ts` |
| Utilitaires/lib | kebab-case | `stroke-validator.ts` |
| Pages (App Router) | `page.tsx` | `app/langue/page.tsx` |
| Routes API | `route.ts` | `app/api/characters/route.ts` |

### IDs des caractères

Format: `{script}-{caractère}`
- Japonais: `hiragana-あ`, `hiragana-い`
- Russe: `cyrillic-А`, `cyrillic-Б`

### Imports dans `apps/web`

Path aliases configurés dans `tsconfig.json`:
```typescript
import { ... } from "#/components/..."   // apps/web/src/
import { ... } from "#auth/..."          // @repo/auth
```

### État

- **UI state** (modals, toggles, input) → Zustand store
- **Server state** (données API) → TanStack Query
- **Form state** → React Hook Form + Valibot

---

## 13. Scripts utiles

### Développement quotidien

```bash
# Tout lancer
bun run dev

# Lint + typecheck
bun run lint
npx tsc --noEmit  # dans apps/web ou apps/server

# Formatter
bun run format

# DB: voir les données
cd packages/database && bun run db:studio
```

### Ajouter un caractère japonais

```bash
# Depuis la racine
node scripts/fetch-kanjivg.js か
# → Affiche les paths SVG à copier dans characters.ts
```

### Générer le schéma Prisma depuis Better-Auth

```bash
cd packages/auth
bun run generate
# → Met à jour packages/database/prisma/schema.prisma
cd ../database
bun run db:push  # Applique les changements
```

### Créer un nouveau workspace dans le monorepo

```bash
bun run new-workspace
# → Interactif (Turborepo generator)
```

### Git workflow

```bash
git checkout -b features/<nom>   # Nouvelle feature
git checkout master              # Retour branche stable
git merge features/<nom>         # Merge (via PR)
```

---

## 14. Roadmap & backlog

### ✅ Déjà livré

- [x] Canvas de dessin avec tracking de traits (pointer events souris + touch)
- [x] Validation de traits (coverage 70% + direction 30%)
- [x] Aperçu animé des caractères (SVG path par path)
- [x] Grille de pratique 3 niveaux (guide → pointillés → vide)
- [x] Support Hiragana (KanjiVG) + Cyrillique (paths manuels)
- [x] API Next.js `/api/characters` et `/api/kanjivg`
- [x] Schéma Prisma complet (Language, Course, Character, UserProgress SM-2, PracticeSession, StrokeAttempt, UserStats)
- [x] Composants UI (Button variants, palette)

---

## 15. Planning semaine par semaine

> **Aujourd'hui**: 25/03/2026 | **Deadline projet**: 05/06/2026 | **Soutenance**: 19/06/2026
> Durée restante : ~10 semaines de dev + 2 semaines de préparation soutenance.

---

### Semaine 1 — 25/03 → 30/03 | **Seed & Migration des données**

Objectif: Les données de caractères quittent `characters.ts` et vivent en base. C'est le prérequis de tout le reste.

- [ ] **Seed script** (`packages/database/prisma/seed.ts`)
  - Créer les entrées `Language` : `{ code: "ja-JP", name: "Japonais", script: "Hiragana" }` et `{ code: "ru-RU", name: "Russe", script: "Cyrillique" }`
  - Créer les `Course` par niveau (courseLevel 1, 2…)
  - Importer tous les caractères de `characters.ts` → insérer `Character` avec `svgPaths` sérialisé en JSON
  - Rendre le seed idempotent (`upsert` sur l'id)
- [ ] **Compléter les Hiragana** — les 46 caractères de base (あ〜ん) via `fetch-kanjivg.js`
  - Script batch pour récupérer tous les paths en une commande
  - Vérifier que les paths passent bien la validation
- [ ] **Compléter le Cyrillique** — les 33 lettres (А〜Я) avec paths manuels
- [ ] **Brancher l'API `/api/characters` sur Prisma** au lieu du fichier statique
  - `GET /api/characters?lang=japanese&level=1` → requête Prisma filtrée
  - Supprimer `apps/web/src/data/characters.ts` une fois le seed validé
- [ ] **Tests manuels** seed + API avec Prisma Studio

---

### Semaine 2 — 31/03 → 06/04 | **Routes API Backend (Hono)**

Objectif: Le serveur Hono expose des routes RESTful pour la progression et les sessions.

- [ ] **`GET /users/me`** — compléter l'endpoint skeleton
  - Auth middleware : vérifier la session Better-Auth, sinon `401`
  - Retourner `{ id, name, email, image, createdAt }`
- [ ] **Middleware d'authentification réutilisable** `apps/server/src/middleware/auth.ts`
  - Extraire la session depuis le cookie, injecter `ctx.user` dans le context Hono
  - Appliquer sur toutes les routes protégées
- [ ] **Routes progression**
  - `GET  /api/progress?lang=ja-JP` → retourne `UserProgress[]` de l'utilisateur courant
  - `GET  /api/progress/:characterId` → progression d'un caractère précis
  - `POST /api/progress/:characterId` → créer/mettre à jour `UserProgress` (score, SM-2)
- [ ] **Routes sessions d'entraînement**
  - `POST /api/sessions` → démarrer une `PracticeSession` (retourne `sessionId`)
  - `PATCH /api/sessions/:id` → compléter la session (score global, totalChars, correctCount)
- [ ] **Routes tentatives**
  - `POST /api/sessions/:sessionId/attempts` → enregistrer un `StrokeAttempt`
- [ ] **Validation des inputs** avec Valibot sur toutes les routes POST/PATCH

---

### Semaine 3 — 07/04 → 13/04 | **Connexion Frontend ↔ Backend**

Objectif: La progression utilisateur est persistée en temps réel pendant les sessions d'entraînement.

- [ ] **Hook `usePracticeSession`**
  - Ouvre une session au démarrage (`POST /api/sessions`)
  - Envoie chaque `StrokeAttempt` après validation (`POST /api/sessions/:id/attempts`)
  - Clôture la session à la fin (`PATCH /api/sessions/:id`)
- [ ] **Hook `useProgress(characterId)`**
  - Fetch `UserProgress` depuis l'API au chargement de la page learn
  - Mise à jour optimiste via TanStack Query après chaque tentative validée
- [ ] **SM-2 côté serveur** dans `POST /api/progress/:characterId`
  - Implémenter l'algorithme SM-2 : calcul `interval`, `easeFactor`, `nextReview`
  - Input: score (0-100) → grade SM-2 (0-5)
  - Incrémenter `successCount`/`failCount`
- [ ] **Progression `practiceLevel`** — avancer de 0→1→2 quand le score dépasse un seuil (ex: 70%)
  - Synchroniser l'état Zustand local avec la DB
- [ ] **Persistance du `practiceLevel`** au rechargement — charger depuis l'API au lieu de partir à 0

---

### Semaine 4 — 14/04 → 20/04 | **Dashboard Utilisateur**

Objectif: L'utilisateur peut voir sa progression globale et par langue.

- [ ] **Page `/dashboard`** (protégée par auth)
  - Stats globales : nb caractères maîtrisés, taux de réussite, streak
  - Progression par langue (barre de progression Hiragana, Cyrillique)
  - Historique des dernières sessions
- [ ] **Composant `ProgressCard`** — un caractère + son niveau de maîtrise (0-3 étoiles)
- [ ] **Composant `StatsOverview`** — cartes KPIs (sessions totales, temps pratiqué, meilleur score)
- [ ] **Page `/profile`** — infos compte + avatar + option déconnexion
- [ ] **Hook `useUserStats`** — fetch stats agrégées depuis l'API
- [ ] **Route `GET /api/stats`** côté serveur — agréger les données (requêtes Prisma groupées)
- [ ] **Navigation** — ajouter le lien Dashboard dans le header/nav principal

---

### Semaine 5 — 21/04 → 27/04 | **Mode Révision (Spaced Repetition)**

Objectif: L'utilisateur peut réviser les caractères dus selon l'algorithme SM-2.

- [ ] **Page `/revision`** — liste les caractères dont `nextReview <= now()`
  - Tri par urgence (nextReview le plus ancien en premier)
  - Indicateur "X caractères à réviser aujourd'hui"
- [ ] **Route `GET /api/revision`** — `UserProgress` où `nextReview <= now()` pour l'utilisateur
- [ ] **Mode révision dans `LearnClient`** — distinguer mode "apprentissage" vs mode "révision"
  - En révision : commencer directement au `practiceLevel` actuel (pas de redémarrage à 0)
  - Après succès : mettre à jour SM-2 et retirer de la file de révision
- [ ] **Reminder visuel** — badge dans la nav si des révisions sont dues
- [ ] **Composant `RevisionQueue`** — liste les caractères dus avec leur prochain intervalle

---

### Semaine 6 — 28/04 → 04/05 | **UX Mobile & Polish UI**

Objectif: L'app est fluide sur mobile et agréable à utiliser.

- [ ] **Canvas responsive** — taille du canvas calculée dynamiquement selon `window.innerWidth`
  - Min 280px, max 400px, centré
  - Recalcul sur resize (ResizeObserver)
- [ ] **Touch events optimisés** — `touch-action: none` pour éviter le scroll pendant le dessin
  - Empêcher le zoom pinch sur le canvas
  - Multi-touch : ignorer les doigts supplémentaires
- [ ] **Transitions de page** avec Motion (Framer Motion / `motion` package)
  - Slide entre les caractères
  - Fade in/out des pages
- [ ] **Feedback haptique** (Vibration API) — courte vibration sur succès/échec (mobile)
- [ ] **Animations de validation** — animation célébration quand un caractère est maîtrisé
- [ ] **Loading states** — skeletons sur les pages qui fetchent des données
- [ ] **Empty states** — messages utiles quand pas de données (0 révisions, 0 caractères)
- [ ] **Review UI audit** — passer l'app en mode mobile (DevTools) et noter les problèmes

---

### Semaine 7 — 05/05 → 11/05 | **Tests & Qualité**

Objectif: Les parties critiques sont testées, le code est sûr pour la soutenance.

- [ ] **Tests unitaires `stroke-validator.ts`** (Bun test)
  - Cas nominal : trait droit, trait courbe
  - Cas limites : trait vide, trait très court, direction inverse
  - Tester chaque score individuel (coverage, direction)
- [ ] **Tests unitaires algorithme SM-2** dans `apps/server`
  - Grade 0, 3, 5 → vérifier interval/easeFactor résultants
- [ ] **Tests d'intégration API** (Hono + Prisma in-memory ou SQLite test)
  - `POST /api/progress/:characterId` — vérifier la mise à jour SM-2
  - `GET /api/revision` — vérifier le filtre `nextReview`
- [ ] **TypeScript strict** — `npx tsc --noEmit` sans erreur sur `apps/web` et `apps/server`
- [ ] **ESLint clean** — `bun run lint` sans warning sur les fichiers modifiés
- [ ] **Audit sécurité basique** — pas de secrets en clair, routes protégées par le middleware auth

---

### Semaine 8 — 12/05 → 18/05 | **Contenu & Fonctionnalités Secondaires**

Objectif: Enrichir le contenu et ajouter les features de valeur pour la démo.

- [ ] **Katakana** — les 46 caractères via KanjiVG + seed
  - Nouveau `Language` : `{ code: "ja-JP-katakana", script: "Katakana" }`
  - Vérifier que la validation fonctionne aussi bien qu'en Hiragana
- [ ] **OAuth Google** via Better-Auth
  - Config `packages/auth` : ajouter le provider Google
  - Bouton "Continuer avec Google" sur les pages sign-in/sign-up
  - Variables d'env `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- [ ] **Kanji basiques JLPT N5** (optionnel si le temps le permet)
  - 10-15 Kanji essentiels : 一 二 三 日 月 山 川 田 人 口
  - Via KanjiVG (même pipeline que Hiragana)
- [ ] **Page d'accueil améliorée** — présenter les langues disponibles avec stats (nb caractères, nb apprenants)

---

### Semaine 9 — 19/05 → 25/05 | **PWA & Performances**

Objectif: L'app peut s'installer sur mobile et charge rapidement.

- [ ] **PWA** — `next-pwa` ou config manuelle `manifest.json` + service worker
  - `manifest.json` : icônes, couleurs, `display: standalone`
  - Service worker : cache des assets statiques
  - Bouton "Installer l'app" sur mobile
- [ ] **Offline partiel** — la page d'apprentissage fonctionne sans réseau si les données sont en cache (TanStack Query `staleTime` élevé)
- [ ] **Optimisation images/SVG** — inline les SVG des caractères pour éviter les requêtes réseau
- [ ] **Core Web Vitals** — auditer avec Lighthouse, corriger les LCP/CLS/FID critiques
- [ ] **Optimistic updates** — toutes les mutations TanStack Query ont un `onMutate` pour une UX instantanée

---

### Semaine 10 — 26/05 → 01/06 | **Finitions & Démo**

Objectif: L'app est demo-ready. Tout ce qui a été fait fonctionne de bout en bout.

- [ ] **Smoke tests manuels** du flow complet (inscription → cours → révision → dashboard)
- [ ] **Fix bugs** découverts pendant les tests
- [ ] **Contenu de la démo** — compte démo avec données pré-remplies (seed de démo)
- [ ] **README** — mettre à jour avec instructions de lancement, captures d'écran
- [ ] **Variables d'env** — documenter toutes les variables requises pour la prod
- [ ] **Deploy preview** — déployer sur Vercel (web) + Railway/Fly.io (server) pour la démo live

---

### Semaine 11 — 02/06 → 05/06 | **Buffer & Deadline**

- [ ] Corrections de dernière minute
- [ ] Gel du code (feature freeze)
- [ ] Tag de release `v1.0.0`

---

### Semaine 12-13 — 06/06 → 19/06 | **Préparation Soutenance**

- [ ] Slides de présentation (stack, architecture, démo live, challenges)
- [ ] Script de démo — définir le parcours utilisateur à montrer
- [ ] Anticiper les questions du jury (choix tech, SM-2, validation de traits, monorepo)
- [ ] Répétitions

---

### Dettes techniques (à traiter au fil des semaines)

- [ ] Tests unitaires `stroke-validator.ts` → Semaine 7
- [ ] Migrer `characters.ts` vers DB → Semaine 1
- [ ] Compléter `/users/me` → Semaine 2
- [ ] Middleware d'auth sur routes protégées → Semaine 2
- [ ] TypeScript strict sans erreur → Semaine 7

---

*Devbook mis à jour le 25/03/2026 — Sen: Learn the Line*


