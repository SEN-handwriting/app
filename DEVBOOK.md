# DEVBOOK — Sen: Learn the Line

> Guide de développement complet du projet Sen.
> Dernière mise à jour: 13/03/2026

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
model User {
  id            String    @id
  name          String
  email         String    @unique
  emailVerified Boolean   @default(false)
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  sessions      Session[]
  accounts      Account[]
}

model Session {
  id        String   @id
  expiresAt DateTime
  token     String   @unique
  userId    String
  user      User     @relation(onDelete: Cascade)
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Account { ... }      // OAuth / credentials
model Verification { ... } // Email verification tokens
```

> **Important**: Les données de caractères et la progression utilisateur ne sont pas encore persistées en base. Les caractères sont dans `apps/web/src/data/characters.ts`.

### À implémenter (backlog DB)
- `CharacterProgress` — progression par utilisateur et caractère
- `LearningSession` — sessions d'entraînement
- `UserStats` — statistiques globales

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

### En cours (branche `features/proto-canvas`)
- [x] Canvas de dessin avec tracking de traits
- [x] Validation de traits (coverage + direction)
- [x] Aperçu animé des caractères (SVG)
- [x] Grille de pratique avec 3 niveaux
- [x] Support Hiragana (KanjiVG)
- [x] Support Cyrillique (paths manuels)
- [x] API `/api/characters` et `/api/kanjivg`

### Priorité haute (next sprint)
- [ ] **Persistance de la progression** — `CharacterProgress` en DB
  - Score par caractère, nombre de tentatives, maîtrise (0-3)
  - Lié à l'utilisateur (User)
- [ ] **Tableau de bord utilisateur** — stats, historique, progression
- [ ] **Compléter les caractères** — tous les Hiragana (46), tout l'alphabet cyrillique
- [ ] **Spaced repetition** — algorithme de révision espacée (SM-2 ou similaire)
- [ ] **Amélioration UX mobile** — touch events optimisés, taille canvas responsive

### Priorité moyenne
- [ ] **OAuth** — Google / GitHub sign-in via Better-Auth
- [ ] **Katakana** — Ajout du script japonais Katakana
- [ ] **Kanji basiques** — JLPT N5 (avec KanjiVG)
- [ ] **Mode révision** — revoir les caractères mal maîtrisés
- [ ] **Animations UI** — transitions page avec Motion (déjà installé)

### Priorité basse / future
- [ ] **Multijoueur** — challenge entre utilisateurs (Maps + Chat dans tsconfig aliases)
- [ ] **Leaderboard** — classement par langue/niveau
- [ ] **PWA** — installation mobile, offline support
- [ ] **Son** — retour audio personnalisé par langue

### Dettes techniques
- [ ] Tests unitaires (`stroke-validator.ts` — critique à tester)
- [ ] Tests E2E (Playwright) pour le flow d'apprentissage
- [ ] Migrer `characters.ts` vers DB avec seed script
- [ ] Compléter `/users/me` endpoint
- [ ] Ajouter middleware d'auth sur les routes protégées

---

*Devbook généré le 13/03/2026 — Sen: Learn the Line*
