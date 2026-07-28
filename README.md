# 🍳 Cooked - Your Ultimate AI-Powered Culinary Companion

Welcome to **Cooked**, a state-of-the-art, AI-driven platform designed to revolutionize recipe management, meal planning, and kitchen organization. Combining a robust dual-backend with a modern React Native mobile app, Cooked delivers a seamless, high-performance, and secure experience for food lovers and culinary creators.

---

## 🌟 Key Features

### ⚡ Production Caching & Performance Architecture
- **Redis Caching Layer (`django-redis`):** High-speed response caching for recipe listings, popular feeds, and user collections via `get_or_set_cache()` parameterized helpers.
- **Automatic Signal-Based Cache Invalidation:** Real-time cache purging on **CREATE, UPDATE, and DELETE** via `post_save` and `post_delete` signals on `Recipe`, `SavedRecipe`, `RecipeRating`, `CookBook`, `CookBookRecipes`, and `GroceryItem` models.

### 🔐 Enterprise Security & Token Lifecycle
- **Hardware-Encrypted Storage:** JWT authentication tokens stored securely inside iOS Keychain and Android Keystore using **Expo `SecureStore`** (`expo-secure-store`).
- **Server-Side Token Rotation & Blacklisting:** Configured `rest_framework_simplejwt.token_blacklist` with `ROTATE_REFRESH_TOKENS = True` and `BLACKLIST_AFTER_ROTATION = True`. Blacklists refresh tokens on server upon logout (`POST /api/users/auth/logout/`).
- **Transparent 401 Response Interceptor:** Mobile client automatically catches `401 Unauthorized` errors, refreshes access tokens in the background, retries the request seamlessly, or purges session state upon token revocation.
- **Security Hardening Headers:** Enabled `SECURE_BROWSER_XSS_FILTER`, `SECURE_CONTENT_TYPE_NOSNIFF`, and `X_FRAME_OPTIONS = 'DENY'` alongside REST Framework rate-limiting throttles.

### 📧 Functional SMTP Email System & HTML Templates
- **Real SMTP Dispatch:** Configurable SMTP mail engine (`django.core.mail.backends.smtp.EmailBackend`) for Gmail SMTP, Resend, or SendGrid via `.env`.
- **Branded Responsive HTML Email Templates:** Rich HTML email delivery for OTP verification codes and password reset requests with logo headers, highlighted 6-digit OTP badges, expiration timers, and security disclaimers.

### 🤖 AI-Powered Intelligence
- **Intelligent Meal Planning with LangGraph:** Utilizes **LangGraph** to manage complex, stateful, and cyclic AI workflows for iterative meal plan refinement and automated validation.
- **Agentic Orchestration via LangChain:** Uses **LangChain** to orchestrate LLM services (Google Gemini & xAI Grok) with structured output parsing (Pydantic) and tool-calling capabilities.
- **Smart Ingredient & Recipe Scanning:** Scan pantry items or dish photos to identify ingredients and retrieve instant recipe suggestions.
- **Automated Nutritional Breakdown:** Computes accurate macro-nutrients (proteins, carbs, fats, calories) for any recipe using advanced LLM pipelines.

### 🍱 Kitchen & Grocery List Management
- **Named Grocery Lists & Recipe Grocery Generation:** Create custom grocery lists (e.g. *"Weekly Market"*) or automatically generate named grocery lists directly from recipes preserving exact ingredient quantities and units.
- **Interactive Check-Off & Progress Tracking:** Track bought vs. remaining items with dynamic progress bars and tick options.
- **Cookbooks & Recipe Collections:** Organize recipes into custom cookbooks with Cloudinary cover art, difficulty badges, and macro breakdowns.
- **Centralized Cloudinary Storage & Auto Cleanup:** Automated image storage lifecycle hooks (`utils/cloudinary_service.py`) that instantly destroy old images on Cloudinary upon model update or deletion.

### 🎨 Premium Mobile UX & UI Design System
- **Unified Component Design:** Universal `RecipeCard` component across Home, Explore, and Cookbooks.
- **Bottom-Up Action Dialogues:** Sleek bottom-up sliding action sheets (`BottomActionSheet`) with top handles and vertical 3-dot action triggers.
- **Custom Alert & Toast System:** Glassmorphic toast notifications (`Toast`) and custom dialog popups (`CustomAlertModal`).

---

## 🏗️ Architecture

Cooked employs a modular **Full-Stack Architecture**:

1.  **Django Backend (`/Server/django_backend`):**
    - Primary relational database server connected to **PostgreSQL** (`cooked_db`).
    - Integrated with **Redis Cache** (`django-redis`) with automatic model signal invalidation.
    - Centralized Cloudinary Storage Service (`utils/cloudinary_service.py`) with `pre_save` and `post_delete` signal bindings.
    - Built with Django Rest Framework (DRF) supporting `MultiPartParser`, `FormParser`, and `JSONParser`.

2.  **FastAPI AI Microservice (`/Server/fastapi_backend`):**
    - High-performance AI service running on port `6000`.
    - Orchestrates **LangChain** and **LangGraph** workflows.
    - Handles asynchronous requests for vision-based scanning and intelligent meal generation.

3.  **Mobile Client (`/Client`):**
    - Built with **React Native**, **Expo Router**, **TypeScript**, and **Zustand** state management.
    - Encrypted token storage via **Expo `SecureStore`** with automatic 401 token refresh interceptor.

---

## 🛠️ Tech Stack

### Mobile Frontend
- **React Native & Expo Router**
- **TypeScript**
- **Expo `SecureStore`** (Hardware Keychain / Keystore Encryption)
- **Zustand** (State Management with AsyncStorage Persistence)
- **React Native Safe Area Context & Reanimated**

### Backend Services
- **Python 3.12+**
- **Django 6.0 & Django Rest Framework**
- **FastAPI**
- **PostgreSQL** (`cooked_db`)
- **Redis & `django-redis`** (High-Performance Caching)
- **SimpleJWT Token Blacklist**
- **LangChain & LangGraph**
- **Cloudinary** (`django-cloudinary-storage`)

---

## 🚀 Getting Started

### Prerequisites
- Python 3.12+
- Node.js 18+
- PostgreSQL running locally (port `5432`)
- Redis running locally (port `6379`) or `.env` `REDIS_URL`
- Cloudinary Credentials, SMTP Email Credentials & Google Gemini / xAI Grok API Keys

### 1. Setup Django Backend
```bash
cd Server/django_backend
python -m venv .django_venv
# Windows: .django_venv\Scripts\activate | macOS/Linux: source .django_venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

### 2. Setup FastAPI AI Microservice
```bash
cd Server/fastapi_backend
python -m venv .fastapi_venv
# Windows: .fastapi_venv\Scripts\activate | macOS/Linux: source .fastapi_venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 6000
```

### 3. Setup React Native Mobile Client
```bash
cd Client
npm install
npx expo start
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Made with ❤️ for foodies everywhere.*
