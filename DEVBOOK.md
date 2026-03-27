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

### MCD — Modèle Conceptuel de Données

Le schéma est organisé en **5 zones fonctionnelles** :

#### Zones

| Zone | Couleur | Entités |
|---|---|---|
| 🔐 Auth | Bleu | `User`, `Session`, `Account`, `Verification`, `UserStats` |
| 📚 Contenu Caractères | Vert | `Language`, `Course`, `Character` |
| 💬 Contenu Phrases | Violet | `Lesson`, `Sentence` |
| 🧠 SM-2 / Progression | Amber | `UserProgress`, `SentenceProgress` |
| 🎯 Sessions | Coral | `PracticeSession`, `StrokeAttempt` |

#### Schéma complet

```
🔐 AUTH
┌─────────────────┐     1:N    ┌──────────────┐     1:N    ┌──────────────────────┐
│     User        │ ─────────► │   Session    │            │       Account        │
│  id (PK·cuid)   │            │  id (PK)     │            │  id (PK)             │
│  name           │ ─────────► │  token ★UNIQ │            │  accountId           │
│  email ★UNIQUE  │   1:N      │  expiresAt   │            │  providerId          │
│  emailVerified  │            │  userId (FK) │            │  password ?          │
│  image ?        │            └──────────────┘            │  accessToken ?       │
│  createdAt      │                                        │  userId (FK)  ★INDEX │
│  updatedAt      │ ─────────────────────────────────────► └──────────────────────┘
│  stats? (FK)    │   1:N
│                 │ ──► UserStats / UserProgress / SentenceProgress / PracticeSession
└─────────────────┘

📚 CONTENU CARACTÈRES
┌──────────────────┐   1:N   ┌──────────────────┐  0..1:N  ┌─────────────────────────┐
│    Language      │ ──────► │     Course       │ ───────► │       Character         │
│  id (PK·cuid)    │         │  id (PK·cuid)    │          │  id (PK) ex: hiragana-あ│
│  code ★UNIQUE    │         │  level : Int     │          │  label                  │
│  name            │         │  title           │          │  audioText              │
│  script ?        │ ──────► │  description ?   │          │  strokeCount ?          │
│  isActive        │   1:N   │  languageId (FK) │          │  languageLevel ?        │
│  createdAt       │         │  ★UNIQUE(langId, │          │  courseLevel (dénorm.)  │
└──────────────────┘         │    level)        │          │  svgPaths (JSON)        │
                             └──────────────────┘          │  meanings ? (JSON)      │
                                                           │  romanization ? (JSON)  │
                                                           │  readings ? (JSON)      │
                                                           │  languageId (FK)        │
                                                           │  courseId ? (FK)        │
                                                           └─────────────────────────┘

💬 CONTENU PHRASES
┌──────────────────┐  1:N   ┌──────────────────┐  1:N   ┌─────────────────────────┐
│     Course       │ ─────► │     Lesson       │ ─────► │       Sentence          │
│  (voir ci-dessus)│        │  id (PK·cuid)    │        │  id (PK·cuid)           │
└──────────────────┘        │  title           │        │  text (langue cible)    │
                            │  description ?   │        │  translation (fr)       │
┌──────────────────┐  1:N   │  order : Int     │        │  romanization ?         │
│    Language      │ ─────► │  requiredLevel ? │        │  audioText ?            │
└──────────────────┘        │  courseId (FK)   │        │  lessonId (FK)          │
                            └──────────────────┘        │  languageId (FK)        │
                                                        └─────────────────────────┘

🧠 PROGRESSION (SM-2)
┌──────────────────────────────────────────────────────────────┐
│  UserProgress               SentenceProgress                 │
│  id (PK·cuid)               id (PK·cuid)                     │
│  ★UNIQUE(userId,charId)     ★UNIQUE(userId,sentenceId)       │
│  ★INDEX(userId,nextReview)  ★INDEX(userId,nextReview)        │
│  practiceLevel 0|1|2        masteryLevel 0|1|2               │
│  ─── SM-2 ──────────────    ─── SM-2 ──────────────          │
│  repetitions                repetitions                       │
│  easeFactor (1.3–2.5)       easeFactor                       │
│  interval (jours)           interval                         │
│  nextReview ★INDEX          nextReview ★INDEX                │
│  successCount / failCount   successCount / failCount         │
│  lastPracticed ?            userId (FK)  characterId (FK)    │
│  userId (FK) charId (FK)    sentenceId (FK)                  │
└──────────────────────────────────────────────────────────────┘

🎯 SESSIONS
┌───────────────────────┐   1:N   ┌──────────────────────────────┐
│   PracticeSession     │ ──────► │       StrokeAttempt          │
│  id (PK·cuid)         │         │  id (PK·cuid)                │
│  startedAt            │         │  score : Float (0-100)       │
│  completedAt ?        │         │  isSuccess : Boolean         │
│  totalChars           │         │  strokeData ? (JSON points)  │
│  correctCount         │         │  feedback ? (JSON métriques) │
│  score ?              │         │  attemptedAt                 │
│  userId (FK)          │         │  sessionId (FK)              │
│  languageId (FK)      │         │  characterId (FK)            │
└───────────────────────┘         └──────────────────────────────┘
```

#### Relations clés

| Relation | Cardinalité | Cascade |
|---|---|---|
| User → Session | 1:N | DELETE |
| User → Account | 1:N | DELETE |
| User → UserStats | 1:N | DELETE |
| User → UserProgress | 1:N | DELETE |
| User → SentenceProgress | 1:N | DELETE |
| User → PracticeSession | 1:N | DELETE |
| Language → Course | 1:N | — |
| Language → Character | 1:N | — |
| Language → Sentence | 1:N | — |
| Course → Lesson | 1:N | — |
| Course → Character | 0..1:N | — |
| Lesson → Sentence | 1:N | — |
| Character → UserProgress | 1:N | DELETE |
| Character → StrokeAttempt | 1:N | DELETE |
| Sentence → SentenceProgress | 1:N | DELETE |
| PracticeSession → StrokeAttempt | 1:N | DELETE |

> **Note :** Le fichier draw.io complet (`sen_mcd_v4.drawio`) est disponible dans les livrables du projet. Il contient toutes les entités colorées par zone fonctionnelle avec les contraintes détaillées (UNIQUE, INDEX, CASCADE).

### Schéma Prisma (SQLite)

```prisma
// ─── Auth (better-auth) ──────────────────────────────────────
model User { id, name, email, sessions[], accounts[], userStats[], progress[], sessions2[] }
model Session { id, token, userId, expiresAt }
model Account { ... }       // OAuth / credentials
model Verification { ... }  // Email verification tokens

// ─── Contenu Caractères ───────────────────────────────────────
model Language { id, code, name, script, characters[], courses[], sentences[] }
model Course    { id, languageId, level, title, characters[], lessons[] }
model Character { id, label, audioText, svgPaths(JSON), strokeCount, languageLevel, ... }

// ─── Contenu Phrases ─────────────────────────────────────────
model Lesson   { id, courseId, title, order, requiredLevel?, sentences[] }
model Sentence { id, lessonId, languageId, text, translation, romanization?, audioText? }

// ─── Progression (SM-2) ──────────────────────────────────────
model UserProgress {
  // practiceLevel 0→1→2
  // repetitions, easeFactor, interval (SM-2)
  // successCount, failCount, nextReview
}
model SentenceProgress {
  // masteryLevel 0→1→2 (lecture, compréhension, production)
  // mêmes champs SM-2 que UserProgress
}
model PracticeSession { id, userId, languageId, startedAt, score, attempts[] }
model StrokeAttempt   { id, sessionId, characterId, score, feedback(JSON), isSuccess }
model UserStats       { id, userId, key, value }  // Stats agrégées clé/valeur
```

### Conventions `languageLevel`

Le champ `languageLevel` sur `Character` est générique et s'adapte au référentiel de chaque langue :

| Langue | Référentiel | Valeurs |
|---|---|---|
| Japonais (`ja-JP`) | JLPT | N5, N4, N3, N2, N1 |
| Russe (`ru-RU`) | CECRL | A1, A2, B1, B2, C1 |
| Chinois (`zh-CN`) | HSK | HSK1, HSK2, HSK3, HSK4, HSK5, HSK6 |
| Arabe (`ar-SA`) | CECRL | A1, A2, B1, B2, C1 |
| Coréen (`ko-KR`) | TOPIK | TOPIK1, TOPIK2, TOPIK3 |

### État des modèles

| Modèle | Schéma | Routes API | Frontend |
|---|---|---|---|
| User / Session / Account | ✅ | ✅ Better-Auth | ✅ |
| Language | ✅ | ❌ | ❌ |
| Course | ✅ | ❌ | ❌ |
| Character | ✅ | ⚠️ fichier statique | ⚠️ |
| Lesson | ⬜ À créer | ❌ | ❌ |
| Sentence | ⬜ À créer | ❌ | ❌ |
| UserProgress | ✅ | ❌ | ❌ |
| SentenceProgress | ⬜ À créer | ❌ | ❌ |
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
  languageLevel?: string;  // N5/N4/N3 (JLPT), A1/A2 (CECRL), HSK1… (HSK) — générique
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

### Flow d'apprentissage — Caractères (core loop)

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
    ↓ Caractère maîtrisé (practiceLevel 2 → SM-2)
Caractère suivant (ou fin du cours)
```

### Flow d'apprentissage — Phrases (après maîtrise des caractères)

```
Cours maîtrisé (tous les caractères à practiceLevel 2)
    ↓ Leçons disponibles débloquées
/lecons/[lessonId]
    ↓
┌─────────────────────────────────┐
│  Phrase affichée                │
│  → Texte en langue cible        │
│  → Bouton audio (TTS)           │
│  → Romanisation (optionnelle)   │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  masteryLevel 0 : lecture       │
│  → Affichage + traduction       │
│                                  │
│  masteryLevel 1 : compréhension │
│  → QCM / association            │
│                                  │
│  masteryLevel 2 : production    │
│  → Saisie libre / tracé         │
└─────────────────────────────────┘
    ↓ Phrase maîtrisée → SentenceProgress SM-2
Phrase suivante (ou fin de leçon)
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
- [ ] **Compléter le Cyrillique** — les 33 lettres (А〜Я) avec paths manuels
- [ ] **Brancher l'API `/api/characters` sur Prisma** au lieu du fichier statique
- [ ] **Ajouter les modèles Prisma** `Lesson`, `Sentence`, `SentenceProgress` au schéma
- [ ] **Tests manuels** seed + API avec Prisma Studio

---

### Semaine 2 — 31/03 → 06/04 | **Routes API Backend (Hono)**

- [ ] **`GET /users/me`** — compléter l'endpoint skeleton
- [ ] **Middleware d'authentification réutilisable** `apps/server/src/middleware/auth.ts`
- [ ] **Routes progression caractères**
  - `GET  /api/progress?lang=ja-JP` → retourne `UserProgress[]`
  - `POST /api/progress/:characterId` → créer/mettre à jour (SM-2)
- [ ] **Routes sessions d'entraînement**
  - `POST /api/sessions` → démarrer une `PracticeSession`
  - `PATCH /api/sessions/:id` → compléter la session
  - `POST /api/sessions/:sessionId/attempts` → enregistrer un `StrokeAttempt`
- [ ] **Validation des inputs** avec Valibot sur toutes les routes POST/PATCH

---

### Semaine 3 — 07/04 → 13/04 | **Connexion Frontend ↔ Backend**

- [ ] **Hook `usePracticeSession`** — ouvre, peuple, clôture une session
- [ ] **Hook `useProgress(characterId)`** — fetch + mise à jour optimiste
- [ ] **SM-2 côté serveur** dans `POST /api/progress/:characterId`
- [ ] **Progression `practiceLevel`** synchronisée DB ↔ état Zustand

---

### Semaine 4 — 14/04 → 20/04 | **Dashboard Utilisateur**

- [ ] **Page `/dashboard`** — stats globales, progression par langue
- [ ] **Composant `ProgressCard`** — caractère + niveau de maîtrise (0-3 étoiles)
- [ ] **Composant `StatsOverview`** — KPIs (sessions totales, streak, meilleur score)
- [ ] **Page `/profile`** — infos compte + avatar + déconnexion
- [ ] **Route `GET /api/stats`** — agréger les données

---

### Semaine 5 — 21/04 → 27/04 | **Mode Révision (Spaced Repetition)**

- [ ] **Page `/revision`** — liste les caractères et phrases dont `nextReview <= now()`
- [ ] **Route `GET /api/revision`** — `UserProgress` + `SentenceProgress` dus
- [ ] **Mode révision dans `LearnClient`** — partir au `practiceLevel` actuel
- [ ] **Reminder visuel** — badge dans la nav si des révisions sont dues

---

### Semaine 6 — 28/04 → 04/05 | **Leçons & Phrases**

- [ ] **Modèles Prisma** `Lesson` + `Sentence` + `SentenceProgress` seedés
- [ ] **Page `/lecons/[lessonId]`** — affichage d'une phrase avec ses 3 niveaux de maîtrise
- [ ] **Routes API** `GET /api/lessons`, `POST /api/sentence-progress/:sentenceId`
- [ ] **Débloquage des leçons** — conditonné par la maîtrise des caractères du cours

---

### Semaine 7 — 05/05 → 11/05 | **UX Mobile & Polish UI**

- [ ] **Canvas responsive** — taille dynamique selon `window.innerWidth`
- [ ] **Touch events optimisés** — `touch-action: none`, anti-zoom
- [ ] **Transitions de page** avec Motion
- [ ] **Loading states** — skeletons
- [ ] **Empty states** — 0 révisions, 0 caractères, 0 phrases

---

### Semaine 8 — 12/05 → 18/05 | **Tests & Qualité**

- [ ] **Tests unitaires `stroke-validator.ts`** (Bun test)
- [ ] **Tests unitaires algorithme SM-2**
- [ ] **Tests d'intégration API** (Hono + Prisma)
- [ ] **TypeScript strict** — `npx tsc --noEmit` sans erreur
- [ ] **ESLint clean** — `bun run lint` sans warning

---

### Semaine 9 — 19/05 → 25/05 | **Contenu & PWA**

- [ ] **Katakana** — les 46 caractères via KanjiVG + seed
- [ ] **PWA** — `manifest.json` + service worker, icônes
- [ ] **Offline partiel** — `staleTime` élevé TanStack Query
- [ ] **Core Web Vitals** — audit Lighthouse

---

### Semaine 10 — 26/05 → 01/06 | **Finitions & Démo**

- [ ] **Smoke tests manuels** du flow complet
- [ ] **Fix bugs** découverts pendant les tests
- [ ] **Seed de démo** — compte avec données pré-remplies
- [ ] **README** — mettre à jour + captures d'écran
- [ ] **Deploy preview** — Vercel (web) + Railway/Fly.io (server)

---

### Semaine 11 — 02/06 → 05/06 | **Buffer & Deadline**

- [ ] Corrections de dernière minute
- [ ] Gel du code (feature freeze)
- [ ] Tag de release `v1.0.0`

---

### Semaine 12-13 — 06/06 → 19/06 | **Préparation Soutenance**

- [ ] Slides de présentation (stack, architecture, démo live, challenges)
- [ ] Script de démo — définir le parcours utilisateur à montrer
- [ ] Anticiper les questions du jury (choix tech, SM-2, validation de traits, monorepo, extensibilité langues)
- [ ] Répétitions

---

### Dettes techniques (à traiter au fil des semaines)

- [ ] Tests unitaires `stroke-validator.ts` → Semaine 8
- [ ] Migrer `characters.ts` vers DB → Semaine 1
- [ ] Ajouter modèles `Lesson` / `Sentence` / `SentenceProgress` → Semaine 1
- [ ] Compléter `/users/me` → Semaine 2
- [ ] Middleware d'auth sur routes protégées → Semaine 2
- [ ] TypeScript strict sans erreur → Semaine 8

---

*Devbook mis à jour le 25/03/2026 — Sen: Learn the Line*