# 🧠 DocuMind AI — RAG Document Intelligence System

Upload any PDF and chat with it instantly. Powered by **Groq Llama-3**, **FAISS vector search**, **Sentence Transformers**, and **Firebase Authentication**.

---

## 📌 Overview

DocuMind AI is a Retrieval-Augmented Generation (RAG) application that lets you upload a PDF document and ask natural language questions about it. Instead of reading through pages manually, the system finds the most semantically relevant sections and delivers precise, context-grounded answers in real time — with zero hallucinations from outside the document.

---

## ✨ Features

- 📄 **PDF Upload & Indexing** — Upload any PDF; text is extracted, chunked, and embedded automatically
- 🔍 **Semantic Search** — FAISS vector index finds the most relevant chunks for each query
- ⚡ **Ultra-Fast Answers** — Groq LPU inference delivers near-instant responses with Llama-3.1-8b
- 🧠 **Context-Only Answers** — AI strictly answers from your document; replies "Information not found" if the answer isn't in the PDF
- 🔐 **Firebase Authentication** — Email/password signup and Google Sign-In; protected dashboard with auth guard
- 💬 **Clean Chat UI** — Dark-themed chat interface with user/AI message bubbles and Enter-to-send support
- 🗂️ **Document Panel** — Sidebar shows the currently active document name after upload

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, Flask |
| LLM | Groq API — `llama-3.1-8b-instant` |
| Embeddings | Sentence Transformers (`all-MiniLM-L6-v2`) |
| Vector Store | FAISS (`faiss-cpu`) |
| Text Splitting | LangChain `RecursiveCharacterTextSplitter` |
| PDF Parsing | PyPDF2 |
| Authentication | Firebase (Email/Password + Google Sign-In) |
| Frontend | HTML, Tailwind CSS, Vanilla JavaScript |

---

## 📁 Project Structure

```
DocuMind-AI-RAG-Project/
├── app.py                  # Flask backend — upload, FAISS indexing, RAG Q&A
├── Requirements.txt        # Python dependencies
├── .env                    # 🔒 Secret keys (never commit)
├── .gitignore              # Excludes .env, uploads/, docs.index, __pycache__
├── docs.index              # FAISS vector index (auto-generated on first upload)
├── LICENSE                 # MIT License
├── uploads/                # Temporary upload folder (auto-created at startup)
├── static/
│   ├── css/
│   │   └── style.css       # Additional styles
│   └── js/
│       ├── auth.js         # Firebase init, Google Sign-In, email login, signup
│       └── chat.js         # PDF upload handler, chat send/receive, auth guard
└── templates/
    ├── index.html          # Landing page
    ├── login.html          # Login page
    ├── signup.html         # Signup page
    └── dashboard.html      # Main chat dashboard (dark UI)
```

---

## ⚙️ Installation & Setup

### Prerequisites

- Python 3.8+
- A [Groq API key](https://console.groq.com) (free tier available)
- A Firebase project with Authentication enabled

### 1. Clone the Repository

```bash
git clone https://github.com/AshishSharma-123/DocuMind-AI-RAG-Project.git
cd DocuMind-AI-RAG-Project
```

### 2. Install Dependencies

```bash
pip install flask python-dotenv groq faiss-cpu numpy PyPDF2 langchain-text-splitters sentence-transformers
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key_here
SECRET_KEY=your_random_flask_secret_key_here
```

Get your Groq API key at [console.groq.com](https://console.groq.com).

> ⚠️ **Never commit your `.env` file.** It is already listed in `.gitignore`.

### 4. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com) and create a project
2. Enable **Authentication** → Sign-in methods: **Email/Password** and **Google**
3. Copy your Firebase web app config and replace the placeholder values in `static/js/auth.js`:

```javascript
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};
```

### 5. Run the App

```bash
python app.py
```

Open your browser at **http://localhost:5000**

---

## 🚀 How to Use

1. **Sign Up / Log In** — Create an account or use Google Sign-In
2. **Upload a PDF** — Click the paperclip icon in the chat input and select a PDF file
3. **Wait for indexing** — The system extracts text, chunks it, and builds the FAISS index
4. **Ask questions** — Type any question about the document and press Enter or click Send
5. **Get answers** — The AI retrieves the top relevant chunks and generates a precise answer

---

## 🔄 How RAG Works (Under the Hood)

```
┌─────────────────────────────────────────────────────────────┐
│                        INDEXING PHASE                        │
│                                                              │
│  PDF Upload → PyPDF2 text extract → LangChain chunking       │
│  (1000 chars, 200 overlap) → Sentence Transformer embeds     │
│  → FAISS IndexFlatL2 → saved to docs.index                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                       QUERY PHASE                            │
│                                                              │
│  User Query → Sentence Transformer embed → FAISS top-6      │
│  search → deduplicate chunks → build context string          │
│  → Groq Llama-3.1-8b-instant → structured answer            │
└─────────────────────────────────────────────────────────────┘
```

**Key parameters:**
- Chunk size: `1000` characters with `200` character overlap
- Top-K retrieval: `6` most similar chunks per query
- LLM temperature: `0.0` (deterministic, factual answers)
- Embedding model: `all-MiniLM-L6-v2` (384-dimensional vectors)

---

## 🧩 API Routes

| Route | Method | Description |
|---|---|---|
| `/` | GET | Landing page |
| `/login` | GET | Login page |
| `/signup` | GET | Signup page |
| `/dashboard` | GET | Main chat dashboard (requires Firebase auth) |
| `/upload` | POST | Upload PDF, extract text, build FAISS index |
| `/ask` | POST | Send a query, retrieve context, get AI answer |

### `/upload` — Request & Response

```
POST /upload
Content-Type: multipart/form-data

file: <pdf_file>

→ { "message": "Indexed 42 chunks", "filename": "report.pdf" }
→ { "error": "PDF empty/unreadable" }
```

### `/ask` — Request & Response

```
POST /ask
Content-Type: application/json

{ "query": "What are the key findings?" }

→ { "answer": "Key Findings\n1. ..." }
→ { "error": "Upload document first" }
```

---

## ⚠️ Known Limitations

- **Single document at a time** — The FAISS index is replaced on each new upload; only one PDF is active per session.
- **No persistent storage** — Uploaded files and the index are stored in memory/local disk and reset when the server restarts.
- **PDF only** — Only `.pdf` files are supported (no DOCX or TXT).
- **No conversation memory** — Each question is independent; the AI does not retain context between messages in the same chat session.
- **Scanned PDFs** — PDFs that are image-only (no text layer) will return an empty extraction error. Use OCR pre-processing for scanned documents.
- **Firebase config in source** — The Firebase config in `auth.js` is client-side and public by design, but make sure Firebase security rules are properly configured in the console.

---

## 🔐 Security Notes

- Keep your `.env` file out of version control — it's already in `.gitignore`
- Rotate your `GROQ_API_KEY` and `SECRET_KEY` if they were ever committed or exposed
- Set Firebase Authentication rules to restrict sign-in to your intended users if deploying publicly

---

## 📄 License

MIT License — free to use, modify, and distribute. See [LICENSE](LICENSE) for details.
