# DocuMind AI — RAG Document Intelligence System

> Upload your PDFs and chat with them instantly. Powered by Groq Llama-3, FAISS vector search, and Firebase Authentication.

---

## What It Does

DocuMind AI lets you upload any PDF document and ask questions about it in plain English. Instead of reading through pages manually, the AI finds the most relevant sections and gives you a precise, context-aware answer — in real time.

---

## Tech Stack


Backend -  Python, Flask 
LLM - Groq API (Llama-3.1-8b-instant) 
Embeddings - Sentence Transformers (`all-MiniLM-L6-v2`) 
Vector Search - FAISS 
Authentication - Firebase (Email/Password + Google Sign-In) 
Frontend - HTML, Tailwind CSS

---

## How It Works

```
Upload PDF → Extract Text → Chunk → Embed → FAISS Index
                                                  ↓
     Answer ← Groq Llama-3 ← Top-K Chunks ← Query Embed
```

1. **Upload** — PDF is parsed and text is extracted
2. **Embed** — Text is split into chunks and converted to vectors using Sentence Transformers
3. **Retrieve** — User query is embedded and matched against FAISS index using semantic search
4. **Generate** — Top matching chunks are sent to Groq Llama-3 as context, which generates a precise answer

---

## Project Structure

```
RAG Project/
├── app.py                  # Flask backend — upload, indexing, RAG logic
├── .env                    # 🔒 Secret keys (never commit this)
├── .env.example            # ✅ Template for environment variables
├── .gitignore              # Excludes .env and other sensitive files
├── docs.index              # FAISS vector index (auto-generated)
├── static/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── auth.js         # Firebase authentication logic
│       └── chat.js         # PDF upload + chat interface logic
├── templates/
│   ├── index.html          # Landing page
│   ├── login.html          # Login page
│   ├── signup.html         # Signup page
│   └── dashboard.html      # Main chat dashboard
└── uploads/                # Temporary upload folder (auto-created)
```

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/DocuMind AI — RAG — Project.git

```

### 2. Install Dependencies

```bash
pip install flask python-dotenv groq faiss-cpu numpy PyPDF2 langchain-text-splitters sentence-transformers
```

### 3. Set Up Environment Variables

Copy the example file and fill in your keys:

```bash
cp .env.example .env
```

Edit `.env`:

```
GROQ_API_KEY=your_groq_api_key_here

```

Get your Groq API key at [console.groq.com](https://console.groq.com)

### 4. Run the App

```bash
python app.py
```

Open your browser at `http://localhost:5000`

---

## Features

- 🔐 **User Authentication** — Email/password and Google Sign-In via Firebase
- 📄 **PDF Upload** — Drag and drop any PDF to index it instantly
- 🔍 **Semantic Search** — FAISS finds the most relevant chunks for your query
- ⚡ **Ultra-Fast Answers** — Groq LPU inference gives near real-time responses
- 🧠 **Context-Only Answers** — AI only answers from your document, no hallucinations

---

## Environment Variables


`GROQ_API_KEY`  Your Groq API key from console.groq.com 


---


## License

MIT License — feel free to use and modify this project.
