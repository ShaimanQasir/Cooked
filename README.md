# 🍳 Cooked - Your Ultimate AI-Powered Culinary Companion

Welcome to **Cooked**, a sophisticated, AI-driven platform designed to revolutionize the way you manage recipes, plan meals, and understand nutrition. By leveraging the power of modern web frameworks and cutting-edge AI, Cooked provides a seamless experience for food enthusiasts and health-conscious individuals alike.

---

## 🌟 Key Features

### 🤖 AI-Powered Intelligence
- **Intelligent Meal Planning with LangGraph:** Unlike simple linear prompts, Cooked uses **LangGraph** to manage complex, stateful, and cyclic AI workflows. This allows for iterative refinement of meal plans, automated validation steps, and sophisticated decision-making loops that ensure high-quality, personalized results.
- **Agentic Orchestration via LangChain:** We utilize **LangChain** to seamlessly orchestrate various LLM services (Gemini & Grok). It handles prompt templating, structured output parsing (Pydantic), and tool-calling, making the AI interactions robust and easily extensible.
- **Smart Image Recognition:** Scan ingredients or finished dishes to instantly identify them and get recipe suggestions or nutritional data.
- **Automated Nutritional Analysis:** Get detailed macro-nutrient breakdowns (proteins, carbs, fats, calories) for any recipe using advanced LLMs.
- **Dual AI Engine:** Supports both **Google Gemini** and **xAI Grok** for versatile and high-performance AI services.

### 🍱 Recipe & Kitchen Management
- **Comprehensive Recipe Database:** Create, discover, and save recipes with detailed instructions, ingredients, and cuisine types.
- **Smart Pantry & Grocery Lists:** Keep track of what you have and what you need, with automated list generation from meal plans.
- **Community Engagement:** Rate, review, and save your favorite recipes from other chefs in the community.
- **Multimedia Support:** Rich recipe pages with image uploads (via Cloudinary) and video URL support.

---

## 🏗️ Architecture

Cooked employs a modern **Dual-Backend Architecture** to ensure both data integrity and high-performance AI processing:

1.  **Django Backend (`/Server/django_backend`):**
    *   Acts as the primary data hub and authentication server.
    *   Manages User Profiles, Recipes, Cookbooks, Groceries, and Pantry.
    *   Implements secure JWT authentication with cookie-based storage.
    *   Utilizes Django Rest Framework (DRF) for a robust API.

2.  **FastAPI Backend (`/Server/fastapi_backend`):**
    *   A high-performance microservice dedicated to AI operations.
    *   Orchestrates complex AI workflows using **LangChain** and **LangGraph**.
    *   Handles asynchronous requests for image scanning and meal plan generation.

3.  **Client (Coming Soon!):**
    *   The frontend is currently under development and will feature a modern, responsive UI designed to make kitchen management effortless.

---

## 🛠️ Tech Stack

### Backends
- **Python 3.12+**
- **Django 6.0 & Django Rest Framework**
- **FastAPI**
- **LangChain & LangGraph** (AI Orchestration)
- **SimpleJWT** (Authentication)

### AI & Services
- **Google Gemini Pro**
- **xAI Grok-1**
- **Cloudinary** (Image Hosting)

### Database
- **SQLite** (Development) / PostgreSQL (Production ready)

---

## 🚀 Getting Started

### Prerequisites
- Python 3.12 or higher
- API Keys for Google Gemini and/or xAI Grok
- Cloudinary Account

### 1. Setup Django Backend
```bash
cd Server/django_backend
python -m venv .django_venv
source .django_venv/bin/activate  # Or `.django_venv\Scripts\activate` on Windows`
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 2. Setup FastAPI Backend
```bash
cd Server/fastapi_backend
python -m venv .fastapi_venv
source .fastapi_venv/bin/activate  # Or `.fastapi_venv\Scripts\activate` on Windows`
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

---

## 📸 Project Roadmap
- [ ] Integration of the React/Angular Frontend.
- [ ] Real-time collaboration on Grocery Lists.
- [ ] Advanced Kitchen Inventory tracking with expiration alerts.
- [ ] Offline-first mobile application.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Made with ❤️ for foodies everywhere.*
