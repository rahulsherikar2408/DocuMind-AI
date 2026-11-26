# DocuMind AI

DocuMind AI is a full-stack AI document intelligence and Retrieval-Augmented Generation (RAG) platform. Users can upload PDFs and scanned document images, extract text (including OCR via Gemini Vision), chat with their documents with page-cited answers, generate structured summaries, and explore AI-suggested questions.

---

## Features

- **Authentication & User Sync**: Sign-up, sign-in, and protected routes powered by **Clerk** (`@clerk/react` & `@clerk/express`), with automatic user synchronization to MongoDB.
- **PDF & Scanned Image Uploads**: Upload PDFs and images (`.pdf`, `.png`, `.jpg`, `.jpeg`, `.webp`, up to 10 MB) via Multer, stored privately in **Cloudinary** (`authenticated` delivery with signed download URLs).
- **Text Extraction & Gemini Vision OCR**: Extracts text from standard PDFs using `pdf-parse` and processes scanned PDFs or images with **Gemini Vision OCR** (`===PAGE N===` page-preserving extraction).
- **RAG Pipeline & Vector Search**:
  - Splits document pages into overlapping chunks (1,000 characters with 200-character overlap) while preserving page numbers.
  - Generates 768-dimensional embeddings using `gemini-embedding-001`.
  - Performs semantic retrieval via **MongoDB Vector Search** (`$vectorSearch` on `document_chunks_vector_index`).
- **Context-Grounded Document Chat**: Persistent chat sessions per document where answers are grounded strictly in retrieved chunks, complete with page-level source citations and Markdown rendering.
- **AI Summaries & Suggested Questions**:
  - One-click structured document summaries (overview, main topics, important points, key findings).
  - Auto-generated suggested questions tailored to each document's contents.
- **Subscriptions & Billing (Razorpay)**:
  - **Free** (`₹0`): Up to 2 documents/day, PDF & OCR support, `gemini-3.1-flash-lite`.
  - **Plus** (`₹99`): Up to 10 documents/day, PDF & OCR support, `gemini-3.1-flash-lite`.
  - **Pro** (`₹199`): Unlimited daily documents, PDF & OCR support, and model switching between `gemini-3.1-flash-lite` and `gemini-3.5-flash-lite`.
  - Includes Razorpay order creation, payment signature verification, downgrade to Free, and billing history.
- **Notifications & Support**: In-app notifications (subscription activation, expiry reminders, support updates) and a support ticket submission/tracking workflow.
- **Responsive UI & Theming**: Built with React 19, TypeScript, Tailwind CSS v4, TanStack Query, light/dark mode toggle, and toast notifications.

---

## Tech Stack

### Frontend (`client/`)
- **Framework**: React 19, TypeScript, Vite 8
- **Styling & Icons**: Tailwind CSS v4, Lucide React
- **Routing & State**: React Router v7, TanStack React Query v5, Axios
- **Auth**: Clerk (`@clerk/react`)
- **Rendering**: `react-markdown`, `remark-gfm`

### Backend (`server/`)
- **Runtime & Framework**: Node.js (ES Modules), Express 5
- **Database**: MongoDB with Mongoose 9 & MongoDB Vector Search
- **AI & Embeddings**: Google GenAI SDK (`@google/genai`) — `gemini-3.1-flash-lite`, `gemini-3.5-flash-lite`, `gemini-embedding-001`
- **Auth & Security**: Clerk (`@clerk/express`), Helmet, CORS
- **File Handling & Storage**: Multer, `pdf-parse`, Cloudinary
- **Payments**: Razorpay

---

## Project Structure

```text
DocuMind AI/
├── client/                     # React + TypeScript + Vite frontend
│   ├── public/
│   └── src/
│       ├── components/         # UI components (chat, documents, layout, common, providers)
│       ├── contexts/           # Theme & toast contexts
│       ├── hooks/              # React Query & custom hooks
│       ├── pages/              # Landing, Dashboard, Documents, DocumentDetails, Chat, Settings, Auth
│       ├── services/           # Axios API client and endpoint wrappers
│       └── types/              # TypeScript interfaces
├── server/                     # Express + MongoDB + Gemini backend
│   ├── config/                 # DB, Cloudinary, Gemini, Razorpay, and Plan configurations
│   ├── controllers/            # Request handlers
│   ├── middlewares/            # Auth, Multer upload, PDF & message validation
│   ├── models/                 # Mongoose schemas (User, Document, DocumentChunk, Chat, Message, Billing, Notification, SupportTicket)
│   ├── routes/                 # REST API route definitions
│   ├── services/               # PDF/OCR extraction, chunking, embeddings, vector search, RAG, summary, notifications
│   └── index.js                # Express app entry point
└── README.md
```

---

## Prerequisites

- **Node.js** (v18+ recommended)
- **MongoDB Atlas** cluster (required for `$vectorSearch`)
  - Create a Vector Search index named `document_chunks_vector_index` on the `documentchunks` collection with:
    - `embedding` vector field (`768` dimensions, cosine similarity)
    - Filter fields for `user` and `document`
- **Clerk** application (Publishable Key & Secret Key)
- **Google Gemini API Key**
- **Cloudinary** account (Cloud Name, API Key, API Secret)
- **Razorpay** account (Key ID & Key Secret for subscription payments)

---

## Environment Variables

### Server (`server/.env`)

```env
PORT=8000
CLIENT_URL=http://localhost:5173
MONGODB_URI=your_mongodb_connection_string

CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

GEMINI_API_KEY=your_gemini_api_key

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Client (`client/.env`)

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:8000
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

---

## Getting Started

### 1. Install Dependencies & Run the Backend

```bash
cd server
npm install
npm run dev
```

The API server runs by default on `http://localhost:8000`.

### 2. Install Dependencies & Run the Frontend

```bash
cd client
npm install
npm run dev
```

The Vite development server runs by default on `http://localhost:5173`.

### Available Scripts

- **Server (`server/`)**:
  - `npm run dev` — Start server in watch mode (`node --watch index.js`)
  - `npm start` — Start server (`node index.js`)
- **Client (`client/`)**:
  - `npm run dev` — Start Vite dev server
  - `npm run build` — Type-check with TypeScript and build for production (`tsc -b && vite build`)
  - `npm run lint` — Run ESLint
  - `npm run preview` — Preview production build

---

## API Overview

| Prefix | Description |
| :--- | :--- |
| `GET /api/health` | Health check endpoint |
| `/api/users` | Current user profile & model selection (`GET /me`, `PATCH /model`) |
| `/api/documents` | Upload, list, view, and delete documents (`POST /upload`, `GET /`, `GET /:id`, `DELETE /:id`) |
| `/api/chats` | Create/list/delete chats and send/fetch RAG messages (`POST /`, `GET /`, `GET /:id`, `POST /:id/messages`, `GET /:id/messages`, `DELETE /:id`) |
| `/api/summaries` | Generate AI summary for a document (`POST /:documentId`) |
| `/api/suggested-questions` | Generate 5 suggested questions for a document (`GET /:documentId`) |
| `/api/subscriptions` | Plan listing, Razorpay checkout, payment verification, downgrade, and billing history |
| `/api/notifications` | Fetch and mark notifications as read |
| `/api/support` | Create and list user support tickets |
