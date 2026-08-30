# CollegeAI - AI-Powered College Information Assistant (RAG)

CollegeAI is a modern, premium SaaS-style React JS application designed for AI-powered retrieval-augmented generation (RAG) college information assistance.

## 🚀 Features

- **Modern SaaS UI**: Minimalist slate design with deep navy typography and blue-violet accents.
- **RAG Grounded Responses**: Mock AI responses retrieve source references with file names, page numbers, relevance percentages, and text snippets.
- **Student Assistant**: Interactive chatbot interface, past history grouping (Today, Yesterday, Previous 7 Days), department selector filters, suggested question chips, and feedback tracking.
- **Admin Workspace**: Complete document management table, drag-and-drop PDF upload dropzone, 6-step RAG ingestion timeline, knowledge base chunk metrics, and interactive analytics charts.
- **Role-Based Access Control**: `AuthContext` protects `/chat` for Students and `/admin` for Admins.

## 👥 Demo Quick Login Credentials

- **Student Account**: `student@college.com` / `student123` (Navigates to `/chat`)
- **Admin Account**: `admin@college.com` / `admin123` (Navigates to `/admin`)

## 🛠️ Tech Stack

- **Frontend Framework**: React JS (Vite)
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Charts**: Recharts
- **Routing**: React Router DOM (v6)

## 📦 Getting Started

### 1. Installation

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

### 3. Production Build

```bash
npm run build
```

## 🔄 Future Backend Integration Architecture

The frontend abstracts all backend API calls into dedicated services in `src/services/`:

- `authService.js` -> Maps to `/api/auth/*`
- `chatService.js` -> Maps to `/api/chat/*`
- `documentService.js` -> Maps to `/api/documents/*`

To connect a backend server (e.g. Node.js + Pinecone + LLM), replace the mock implementations inside `src/services/` with real `axios` calls without changing any component logic!
