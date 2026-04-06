import os
import faiss
import numpy as np
from dotenv import load_dotenv
from flask import Flask, render_template, request, jsonify
from PyPDF2 import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
from groq import Groq

# ==========================================
# 1. LOAD ENV + INIT
# ==========================================
load_dotenv()

app = Flask(__name__)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY)

print("Loading Embedding Model...")
embed_model = SentenceTransformer('all-MiniLM-L6-v2')

# Global storage
document_chunks = []
INDEX_FILE = "docs.index"

# ==========================================
# 2. HTML ROUTES
# ==========================================
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/login')
def login_page():
    return render_template('login.html')

@app.route('/dashboard')
def dashboard_page():
    return render_template('dashboard.html')

@app.route('/signup')
def signup_page():
    return render_template('signup.html')

# ==========================================
# 3. UPLOAD + INDEXING
# ==========================================
@app.route('/upload', methods=['POST'])
def upload_file():
    global document_chunks

    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']

    try:
        # ---- Extract text ----
        reader = PdfReader(file)
        text = ""
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted

        if not text.strip():
            return jsonify({"error": "PDF empty/unreadable"}), 400

        # ---- Chunking (optimized) ----
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        document_chunks = splitter.split_text(text)

        # ---- Embeddings ----
        embeddings = embed_model.encode(
            document_chunks,
            convert_to_numpy=True
        ).astype('float32')

        # ---- FAISS index ----
        dimension = embeddings.shape[1]
        index = faiss.IndexFlatL2(dimension)
        index.add(embeddings)

        faiss.write_index(index, INDEX_FILE)

        return jsonify({
            "message": f"Indexed {len(document_chunks)} chunks",
            "filename": file.filename
        })

    except Exception as e:
        print("Upload Error:", e)
        return jsonify({"error": str(e)}), 500


# ==========================================
# 4. QUESTION ANSWERING (RAG)
# ==========================================
@app.route('/ask', methods=['POST'])
def ask_question():
    global document_chunks

    data = request.json
    user_query = data.get('query')

    if not user_query:
        return jsonify({"error": "No query"}), 400

    if not os.path.exists(INDEX_FILE) or not document_chunks:
        return jsonify({"error": "Upload document first"}), 400

    try:
        # ---- Query embedding ----
        query_vec = embed_model.encode(
            [user_query],
            convert_to_numpy=True
        ).astype('float32')

        # ---- Load FAISS ----
        index = faiss.read_index(INDEX_FILE)

        # ---- Search top-k ----
        distances, indices = index.search(query_vec, k=3)

        # ---- Clean context ----
        relevant_chunks = [
            document_chunks[i]
            for i in indices[0]
            if i != -1 and i < len(document_chunks)
        ]

        # Remove duplicates
        relevant_chunks = list(dict.fromkeys(relevant_chunks))

        # Limit context
        context = "\n\n".join(relevant_chunks[:3])

        # ---- LLM CALL ----
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            temperature=0.0,
            messages=[
    {
        "role": "system", 
        "content": (
            "You are a precise technical extractor. Answer ONLY from the context.\n\n"
            "FORMAT RULES:\n"
            "1. Use a bolded title for the answer.\n"
            "2. Use a numbered list for points.\n"
            "3. Format: Term – One sentence description.\n"
            "4. Put each numbered point on a NEW LINE.\n"
            "5. If not in context, say 'Information not found.'\n\n"
            "6. DO NOT use asterisks (**), underscores, or any Markdown symbols.\n"
            "EXAMPLE:\n"
            "**Key Features**\n"
            "1. **Scalability** – The ability to handle growing amounts of work.\n"
            "2. **Fault Tolerance** – The system continues operating despite failures."
        )
    },
    {"role": "user", "content": f"Context: {context}\n\nQuestion: {user_query}"}
]
        )

        answer = completion.choices[0].message.content

        return jsonify({"answer": answer})

    except Exception as e:
        print("Groq Error:", e)
        return jsonify({"error": str(e)}), 500


# ==========================================
# 5. RUN SERVER
# ==========================================
if __name__ == '__main__':
    if not os.path.exists('uploads'):
        os.makedirs('uploads')

    app.run(debug=True, port=5000)