# 🍳 Cooked — Production-Grade AI Culinary Platform & Kitchen Ecosystem

[![Python](https://img.shields.io/badge/Python-3.12%2B-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-6.0-092E20.svg?logo=django&logoColor=white)](https://www.djangoproject.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React Native](https://img.shields.io/badge/React%20Native-Expo%20SDK%2057-61DAFB.svg?logo=react&logoColor=black)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.0-4169E1.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7.0-DC382D.svg?logo=redis&logoColor=white)](https://redis.io/)
[![LangChain](https://img.shields.io/badge/LangChain-Agentic%20AI-1C3C3C.svg?logo=langchain&logoColor=white)](https://www.langchain.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Cooked** is an advanced, production-ready AI culinary platform designed to transform meal planning, recipe discovery, grocery management, and kitchen organization. Built with a dual-backend architecture (Django REST API + FastAPI AI Microservice) and a feature-complete React Native mobile application, Cooked brings together enterprise security, stateful agentic AI execution, hardware-encrypted storage, signal-driven Cloudinary media management, and custom mobile UI components.

---

## 💡 Executive Summary & Engineering Philosophy

Modern kitchen and nutrition management applications often suffer from fragmented user flows, static static prompts, insecure token storage, and unoptimized database reads. **Cooked** solves these challenges through clean separation of concerns:

- **Stateful Relational Data Engine (Django 6.0 REST API):** Handles high-integrity transactional state, user profiles, recipe models, cookbooks, grocery items, and SimpleJWT security operations backed by PostgreSQL 16.
- **Dedicated AI Engine (FastAPI Microservice):** Executes asynchronous, heavy LLM operations, multimodal vision processing, and stateful agentic meal planning workflows using LangGraph and LangChain.
- **Cross-Platform Mobile App (React Native Expo SDK 57):** Delivers a responsive mobile UI featuring hardware-encrypted token storage, automatic 401 token refresh interceptors, glassmorphic toasts, custom bottom-up action dialogues, and offline state persistence.

---

## 🌟 Full-Stack Feature Deep-Dive

### 🤖 1. Agentic AI & Multimodal Recognition Engine
- **LangGraph Cyclic State Workflows:** Instead of rigid linear LLM prompts, Cooked uses **LangGraph** state machines to model iterative meal plan generation. The AI engine evaluates user dietary profiles, allergen constraints, household sizes, and pantry inventory, dynamically cycling through validation and correction nodes to eliminate recipe conflicts.
- **LangChain Multimodal Ingredient Scanner:** Leverages Google Gemini Pro Vision and xAI Grok-1 with Pydantic structured output parsers. Users can scan raw ingredients or dish photos using the mobile camera, returning parsed ingredient objects with exact quantities, units, and confidence scores.
- **Automated Macro-Nutrient Computation:** Calculates precise nutritional metrics (calories, protein, carbohydrates, fats, fiber) for any custom or AI-generated recipe.

---

### 🔐 2. Hardware-Encrypted Security & Token Lifecycle
- **Expo `SecureStore` Integration (`Client/services/secureStore.ts`):** JWT access and refresh tokens are encrypted on iOS devices via the **iOS Keychain** and on Android devices via the **Android Keystore**, completely eliminating plain-text storage vulnerabilities.
- **Server-Side Token Rotation & Revocation:** Configured `rest_framework_simplejwt.token_blacklist` with `ROTATE_REFRESH_TOKENS = True` and `BLACKLIST_AFTER_ROTATION = True`. Every refresh token is strictly single-use; calling the logout endpoint (`POST /api/users/auth/logout/`) revokes the refresh token on the server immediately.
- **Transparent 401 Refresh Interceptor (`Client/services/api.ts`):** An Axios/Fetch response interceptor catches HTTP `401 Unauthorized` status codes, executes a background token refresh using secure credentials, queues concurrent API requests, and transparently retries failed operations without user disruption.
- **Security Hardening:** Django settings enforce `SECURE_BROWSER_XSS_FILTER = True`, `SECURE_CONTENT_TYPE_NOSNIFF = True`, `X_FRAME_OPTIONS = 'DENY'`, and REST Framework rate-limiting throttles on authentication routes.

---

### 📧 3. Real Functional SMTP Email & HTML Templates
- **Production SMTP Engine:** Configured via `django.core.mail.backends.smtp.EmailBackend` for direct dispatch through Gmail SMTP, Resend, or SendGrid via environment configuration.
- **Branded Responsive HTML Email Templates (`Server/django_backend/app/users/utils.py`):** OTP verification codes and password reset requests send responsive HTML emails featuring centered logo headers, a prominent 6-digit OTP code badge, expiration timers, and security notices alongside plain-text fallbacks.

---

### 🍱 4. Smart Grocery Lists & Recipe Automation
- **Automated Recipe List Generation:** Tapping *"Add to Grocery"* on any recipe detail page instantly creates a dedicated Grocery List titled with the **Recipe Name** (e.g. *"Lemon Grilled Salmon"*), copying all ingredients with their exact quantities and units (e.g. `250 g`, `1 tbsp`).
- **Custom Named Lists & Optional Quantities:** Users can create custom lists (e.g. *"Weekly Supermarket"*), add items manually with optional quantity inputs, and group items dynamically.
- **Interactive Check-Off & Progress Tracking:** Includes a real-time progress bar (e.g. *"3 of 5 items bought (60%)"*) and checkmark toggles (`checkmark-circle`) with strike-through text styling for completed items.

---

### ☁️ 5. Centralized Cloudinary Media Storage Engine
- **Zero-Orphan Media Lifecycle (`Server/django_backend/utils/cloudinary_service.py`):** A centralized Cloudinary storage module hooks into Django's model signal system (`pre_save` and `post_delete`).
- **Automatic CDN Cleanup:** Updating or deleting a `Recipe` image, `User` profile picture, or `CookBook` cover art automatically deletes the previous file on Cloudinary CDN, keeping media storage clean.

---

### 🎨 6. Production React Native Mobile Frontend (`/Client`)
- **Unified Recipe Components (`RecipeCard.tsx`):** Standardized, reusable card layout across Home, Explore, and Cookbooks featuring cover images, title, cook time badges, difficulty labels, and macro stats.
- **Bottom-Up Action Dialogues (`BottomActionSheet.tsx`):** A bottom-up sliding sheet dialogue with top grab handles, glassmorphic backdrop overlays, and 3-vertical-dots (`ellipsis-vertical`) action menus for recipe options, list options, and item management.
- **Custom Alert Modal (`CustomAlertModal.tsx`):** High-end replacement for native browser alerts, featuring animated scale transitions, color-coded icon badges (`danger`, `warning`, `info`), and confirmation controls.
- **Glassmorphic Toasts (`Toast.tsx`):** Floating top notification pill displaying success, error, warning, and info messages.
- **Full Screen Navigation Coverage:**
  - **Home Dashboard (`(tabs)/index.tsx`):** Daily recommendations, quick stats, meal plan shortcuts, and recently viewed recipes.
  - **Explore Screen (`(tabs)/explore.tsx`):** Dynamic search, cuisine filters, dietary preference tags, and popular recipe grids.
  - **Grocery Lists Screen (`(tabs)/grocery.tsx`):** Expandable horizontal grocery list cards, progress bars, ingredient check-off toggles, and edit modals.
  - **Cookbooks Hub (`cookbook/list.tsx` & `cookbook/[id].tsx`):** Custom cookbook creation, cover art displays, and recipe collection views.
  - **User Profile (`(tabs)/profile-tab.tsx`):** Account settings, favorite recipes, recent views count, dietary preferences, and secure logout.

---

## 🛠️ Complete Technology Stack

| Layer | Technology | Usage |
| :--- | :--- | :--- |
| **Mobile App Framework** | React Native (Expo SDK 57) | Cross-platform iOS & Android frontend application |
| **Routing & Navigation** | Expo Router v4 | File-based typed routing stack |
| **Language** | TypeScript 5.0+ | Strict type safety across client services & components |
| **Client Token Security** | `expo-secure-store` | Hardware Keychain (iOS) & Keystore (Android) encryption |
| **Client State** | Zustand + AsyncStorage | State management & persistent local storage |
| **Primary Backend** | Django 6.0 & DRF | Primary REST API, authentication, database persistence |
| **AI Microservice** | FastAPI & Uvicorn | Asynchronous AI microservice running on port 6000 |
| **AI Orchestration** | LangChain & LangGraph | Cyclic agentic graphs, state machine AI workflows |
| **Vision & LLM Models** | Google Gemini Pro, xAI Grok-1 | Multimodal ingredient scanner & nutrition analysis |
| **Database** | PostgreSQL 16 (`cooked_db`) | Primary relational database |
| **Cache Engine** | Redis (`django-redis`) / `DummyCache` | High-speed response caching & pattern invalidation |
| **Media Storage** | Cloudinary CDN | CDN image hosting with automated signal cleanup |
| **Email Delivery** | Django SMTP + HTML | Real email dispatch for OTPs & Password Resets |

---

## 📂 Repository Directory Layout

```
Cooked/
├── Client/                         # React Native Expo Mobile Application
│   ├── app/                        # Expo Router Pages & Screen Layouts
│   │   ├── (tabs)/                 # Bottom Tab Screens (Home, Explore, Grocery, Profile)
│   │   │   ├── index.tsx           # Home Dashboard Screen
│   │   │   ├── explore.tsx         # Search & Recipe Discovery Screen
│   │   │   ├── grocery.tsx         # Interactive Grocery Lists Screen
│   │   │   └── profile-tab.tsx     # User Profile & Stats Screen
│   │   ├── auth/                   # Authentication Pages (Login, Register, OTP, Password Reset)
│   │   ├── recipe/                 # Recipe Detail, Create, Edit, Recently Viewed Pages
│   │   └── cookbook/               # Cookbooks List & Collection Detail Pages
│   ├── components/                 # Production UI Components
│   │   ├── BottomActionSheet.tsx   # Universal 3-Dot Bottom Action Dialogue
│   │   ├── CustomAlertModal.tsx    # Styled Custom Alert Dialog
│   │   ├── Toast.tsx               # Floating Glassmorphic Toast Component
│   │   └── RecipeCard.tsx          # Standardized Recipe Card Layout
│   ├── services/                   # API Gateways & Secure Token Handlers
│   │   ├── api.ts                  # Axios/Fetch Interceptor & 401 Refresh Logic
│   │   ├── secureStore.ts          # Hardware Keychain / Keystore Wrapper
│   │   ├── auth.service.ts         # User Auth API Endpoints
│   │   ├── recipe.service.ts       # Recipe API Endpoints
│   │   └── grocery.service.ts      # Grocery API Endpoints
│   └── store/                      # Zustand Application Stores
│       ├── useUserStore.ts         # User Authentication & Profile Store
│       ├── useRecipeStore.ts       # Recipes, Favorites & Recently Viewed Store
│       └── useGroceryStore.ts      # Grocery Lists Store
│
├── Server/
│   ├── django_backend/             # Primary Django REST API Server
│   │   ├── app/                    # Modular Django Applications
│   │   │   ├── users/              # Auth, Custom User Model, OTP, HTML Emails
│   │   │   ├── userProfile/        # User Profiles, Dietary Preferences, Onboarding
│   │   │   ├── recipe/             # Recipe, Rating, Saved Recipe Models & Views
│   │   │   ├── cookBook/           # CookBook Models, Views & Media Hooks
│   │   │   ├── grocery/            # Grocery Item Models & Views
│   │   │   └── pantry/             # Pantry Item Models
│   │   ├── config/                 # Settings, SimpleJWT, Redis, Security Headers
│   │   └── utils/                  # Utility Services
│   │       ├── cache_service.py    # Parameterized Redis Cache Service & Signals
│   │       └── cloudinary_service.py # Cloudinary Signal Auto Cleanup Engine
│   │
│   └── fastapi_backend/            # AI Microservice (Port 6000)
│       ├── app/                    # FastAPI Application
│       │   ├── api/                # Vision Scanner & Meal Plan Endpoints
│       │   ├── services/           # LangChain & LangGraph Workflows
│       │   └── main.py             # FastAPI Entry Point
│       └── requirements.txt
│
└── README.md                       # Comprehensive Project Documentation
```

---

## 📡 API Endpoint Reference

### 🔐 Authentication & User Accounts (`/api/users/`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/users/auth/register/` | Register user & send HTML OTP email | ❌ No |
| `POST` | `/api/users/auth/login/` | Authenticate user & return JWT tokens | ❌ No |
| `POST` | `/api/users/auth/verify-otp/` | Verify 6-digit OTP code | ❌ No |
| `POST` | `/api/users/auth/resend-otp/` | Resend OTP code to user email | ❌ No |
| `POST` | `/api/users/auth/token/refresh/` | Obtain new access token via refresh token | ❌ No |
| `POST` | `/api/users/auth/logout/` | Blacklist refresh token on server | `Bearer JWT` |
| `GET` | `/api/users/auth/me/` | Fetch current user credentials | `Bearer JWT` |

### 🍱 Recipe & Cookbook Services (`/api/recipe/` & `/api/cookbook/`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/recipe/recipes/` | List public & author recipes | Optional |
| `POST` | `/api/recipe/recipes/` | Create recipe with Cloudinary image upload | `Bearer JWT` |
| `GET/PUT/DEL` | `/api/recipe/recipes/<id>/` | Fetch, update, or delete recipe | `Author Only` |
| `POST` | `/api/recipe/saved-recipes/` | Toggle save/favorite status on recipe | `Bearer JWT` |
| `GET/POST` | `/api/cookbook/cookbooks/` | List or create cookbooks with cover art | `Bearer JWT` |

### 🛒 Grocery Management (`/api/grocery/`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/grocery/groceries/` | Fetch user grocery items grouped by list | `Bearer JWT` |
| `POST` | `/api/grocery/groceries/` | Create custom item or recipe list items | `Bearer JWT` |
| `PATCH/DEL` | `/api/grocery/groceries/<id>/` | Update quantity, unit, check status or delete | `Bearer JWT` |

### 🤖 AI Microservice (`FastAPI - Port 6000`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/ai/scan-ingredients/` | Process camera image & return parsed items | Internal Key |
| `POST` | `/api/ai/generate-meal-plan/` | LangGraph cyclic agentic meal plan generation | Internal Key |

---

## 🚀 Setup & Installation Guide

### Prerequisites
- **Python 3.12+**
- **Node.js 18+** & **npm**
- **PostgreSQL 16** running locally on port `5432`

---

### 1. PostgreSQL Database Initialization
Open PostgreSQL psql or pgAdmin and execute:
```sql
CREATE DATABASE cooked_db;
CREATE USER postgres WITH PASSWORD '1234';
GRANT ALL PRIVILEGES ON DATABASE cooked_db TO postgres;
```

---

### 2. Primary Django Backend (`/Server/django_backend`)
```bash
# Navigate to Django directory
cd Server/django_backend

# Create virtual environment
python -m venv .django_venv

# Activate virtual environment
# Windows:
.django_venv\Scripts\activate
# macOS/Linux:
source .django_venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Apply database migrations
python manage.py migrate

# Start Django development server
python manage.py runserver 8000
```

---

### 3. FastAPI AI Microservice (`/Server/fastapi_backend`)
```bash
# Open a new terminal and navigate to FastAPI directory
cd Server/fastapi_backend

# Create virtual environment
python -m venv .fastapi_venv

# Activate virtual environment
# Windows:
.fastapi_venv\Scripts\activate
# macOS/Linux:
source .fastapi_venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --reload --port 6000
```

---

### 4. React Native Mobile Client (`/Client`)
```bash
# Open a new terminal and navigate to Client directory
cd Client

# Install dependencies
npm install

# Start Expo development server
npx expo start
```
*Press `a` for Android Emulator, `i` for iOS Simulator, or scan the QR code using Expo Go on your physical device.*

---

## 🔑 Environment Variables Setup

Create a `.env` file in `Server/django_backend/.env`:

```env
# Django Core Settings
SECRET_KEY=cooked-production-super-secret-key-2026
DEBUG=True
ALLOWED_HOSTS=*

# PostgreSQL Database
USE_POSTGRES=True
DB_NAME=cooked_db
DB_USER=postgres
DB_PASSWORD=1234
DB_HOST=localhost
DB_PORT=5432

# Cloudinary CDN Credentials
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Functional SMTP Email Credentials (Gmail / Resend / SendGrid)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_16_character_app_password
DEFAULT_FROM_EMAIL=Cooked <your_email@gmail.com>

# FastAPI Integration
INTERNAL_AUTH_SECRET=internal-microservice-auth-secret
FASTAPI_SERVICE_URL=http://localhost:6000
```

---

## 💡 Key Architectural Patterns Solved

- **Decoupled Architecture:** Separates transaction-heavy CRUD and auth operations (Django) from computationally intensive AI tasks (FastAPI), eliminating bottlenecking.
- **Hardware Token Encryption:** Token storage on iOS Keychain and Android Keystore via `expo-secure-store` protects authentication state from local device extraction.
- **Zero Media Leakage:** Signal-based Cloudinary hooks ensure CDN media storage remains clean when items are edited or removed.
- **Low-Resource Local Development:** Configurable `DummyCache` allows local developers to run the Django server, FastAPI microservice, React Native client, and Android Emulator simultaneously without requiring Docker or Redis containers.

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.

---

<p align="center">
  Made with ❤️ by <strong>Shaiman Qasir</strong> • Full-Stack Architectural Engineering Project
</p>
