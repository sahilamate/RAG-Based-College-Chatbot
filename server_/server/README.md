# CollegeAI Backend API (Node.js + Express + MongoDB)

Production-ready backend API for **CollegeAI**, an AI-powered retrieval-augmented generation (RAG) college information assistant.

---

## 🛠️ Technology Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ORM
- **Authentication**: JSON Web Tokens (JWT) + bcryptjs password hashing
- **Security & Utilities**: Helmet, CORS, Morgan, Multer (PDF File Uploads)

---

## 📁 Directory Structure

```text
server/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   ├── authController.js     # Register, Login, Get Current User, Logout
│   ├── chatController.js     # Chat RAG responses, history, conversation details, feedback
│   ├── documentController.js # PDF upload, document CRUD, filtering & reprocess
│   └── adminController.js    # Dashboard KPIs & Analytics aggregation
├── middleware/
│   ├── authMiddleware.js     # JWT Bearer token authentication & user attachment
│   ├── adminMiddleware.js    # Admin role verification (role === 'admin')
│   ├── errorMiddleware.js    # Centralized JSON error handling & 404 handler
│   └── uploadMiddleware.js   # Multer PDF upload configuration (max 20MB, PDF mime check)
├── models/
│   ├── User.js               # User schema (email, bcrypt password, role, studentId, dept)
│   ├── Document.js           # Document schema (title, fileName, filePath, status, chunks, pages)
│   ├── Conversation.js       # Conversation schema (userId, title, timestamps)
│   └── Message.js            # Message schema (conversationId, role, content, sources, feedback)
├── routes/
│   ├── authRoutes.js         # /api/auth endpoints
│   ├── chatRoutes.js         # /api/chat endpoints
│   ├── documentRoutes.js     # /api/documents endpoints
│   └── adminRoutes.js        # /api/admin endpoints
├── services/
│   ├── chatService.js        # RAG keyword matching & mock answer retrieval
│   ├── documentService.js    # Document DB query helpers & metadata generation
│   ├── ragService.js         # Placeholder interface for future vector search
│   ├── pdfService.js         # Placeholder for future PDF text extraction
│   ├── chunkService.js       # Placeholder for future text chunking
│   ├── embeddingService.js   # Placeholder for future vector embeddings
│   ├── vectorService.js      # Placeholder for Pinecone/Vector DB
│   └── llmService.js         # Placeholder for OpenAI/Gemini LLM
├── utils/
│   ├── generateToken.js      # JWT token signing helper
│   └── response.js           # Standardized API response formatter
├── uploads/                  # Upload directory for PDF files
├── .env                      # Local environment configuration
├── .env.example              # Environment variables template
├── package.json
└── server.js                 # Server entrypoint
```

---

## ⚙️ Installation & Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Variables

Create `.env` inside `server/`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/collegeai
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
UPLOAD_DIR=uploads
MAX_FILE_SIZE=20971520
```

### 3. Seed Default Accounts (Optional)

```bash
node seed.js
```

Seeds preset accounts:
- **Student**: `student@college.com` / `student123`
- **Admin**: `admin@college.com` / `admin123`

### 4. Run Development Server

```bash
npm run dev
```

Server listens on `http://localhost:5000`.

---

## 📡 API Endpoints Summary Table

| Method | Endpoint | Auth Required | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/health` | None | All | Health check status |
| **POST** | `/api/auth/register` | None | Student | Register student account |
| **POST** | `/api/auth/login` | None | All | Authenticate & generate JWT |
| **GET** | `/api/auth/me` | Bearer JWT | All | Get current user profile |
| **POST** | `/api/auth/logout` | Bearer JWT | All | Logout user session |
| **POST** | `/api/chat` | Bearer JWT | Student | Query RAG bot & store conversation |
| **GET** | `/api/chat/history` | Bearer JWT | Student | Get user's conversation list |
| **GET** | `/api/chat/:conversationId` | Bearer JWT | Student | Get conversation messages |
| **DELETE** | `/api/chat/:conversationId` | Bearer JWT | Student | Delete conversation & messages |
| **POST** | `/api/chat/:conversationId/feedback` | Bearer JWT | Student | Submit helpful/not helpful feedback |
| **POST** | `/api/documents/upload` | Bearer JWT | Admin | Upload PDF document (Multer) |
| **GET** | `/api/documents` | Bearer JWT | Admin | Filterable paginated documents |
| **GET** | `/api/documents/:id` | Bearer JWT | Admin | Get document details |
| **DELETE** | `/api/documents/:id` | Bearer JWT | Admin | Delete document file & DB record |
| **POST** | `/api/documents/:id/reprocess` | Bearer JWT | Admin | Reprocess document embeddings |
| **GET** | `/api/admin/dashboard` | Bearer JWT | Admin | Get aggregated KPI statistics |
| **GET** | `/api/admin/analytics` | Bearer JWT | Admin | Get category & feedback analytics |

---

## 🔄 Future RAG Pipeline Roadmap

The services layer in `server/services/` is structured for future RAG integration:

```text
PDF Upload
    ↓
pdfService.js (PDF Text Extraction)
    ↓
chunkService.js (Sliding Window Text Chunking)
    ↓
embeddingService.js (Vector Embedding Generation)
    ↓
vectorService.js (Pinecone / MongoDB Vector DB Indexing)
    ↓
vectorService.js (Similarity Search on Query)
    ↓
llmService.js (OpenAI / Gemini Prompt Generation)
    ↓
Answer + Sources
```
