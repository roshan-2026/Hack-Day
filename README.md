# Code Converter & Equivalence Tester

> An AI-powered, full-stack multi-language code conversion platform with automatic source-language detection, custom conversion prompts, and inline code explanations.

---

## 1. Overview

**Code Converter & Equivalence Tester** converts source code cleanly across five major programming languages:
- **C**
- **C++**
- **Java**
- **Python**
- **JavaScript**

### Key Capabilities
1. **Automatic Language Detection**: Detects C, C++, Java, Python, and JavaScript automatically using heuristic, AST, keyword, and include analysis.
2. **Dynamic Target Selection**: The detected source language is automatically excluded from the "Convert To" language dropdown. The dropdown opens upwards with elevated z-index so it is always fully accessible and never cut off.
3. **AI Code Conversion Engine**: Powered by Google Gemini (`gemini-3.8-flash` via `google-genai` SDK and REST API) using an elite compiler engineering system prompt.
4. **Custom Conversion Instructions**: Clean optional text drawer allowing users to provide custom architectural and stylistic instructions without hardcoded suggestions.
5. **Inline Code Explanations**: Inserts concise, meaningful inline comments (`//` or `#`) directly inside the converted code editor without markdown formatting or conversational noise.
6. **One-Click Actions**:
   - **Paste from Clipboard** (automatically triggers language detection)
   - **Copy Code** (instant clipboard copy with feedback)
   - **Download Code** (downloads with correct file extension: `main.c`, `main.cpp`, `Main.java`, `main.py`, `main.js`)

---

## 2. API Key Configuration

Your Gemini API key is configured directly in the backend environment variables:

1. Open `backend/.env`
2. Add your key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```
The backend automatically reads this key on server startup. The frontend has no UI settings modal or key prompt, keeping the UI completely secure, clean, and distraction-free.

---

## 3. Quick Start

### Step 1: Install Dependencies & Run Backend
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Start backend server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Step 2: Run Frontend (Dev Mode)
In another terminal:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

> **Production Single-Server Mode**:
> If you build the frontend (`cd frontend && npm run build`), the FastAPI backend will automatically serve the entire application at `http://localhost:8000` with zero separate servers needed.

---

## 4. System Prompt Design for LLM

The conversion engine utilizes an elite compiler and software engineering prompt enforcing:
- **Zero Markdown**: Strictly raw, executable source code without code fences (```).
- **Zero Conversational Output**: No greetings, summaries, or postscripts.
- **Strict Equivalence**: Exact algorithmic, mathematical, I/O, and control flow preservation.
- **Language Conventions**: Proper headers, main function structure, class wrappers (`public class Main` for Java), and standard I/O conventions.
- **Inline Comments Only**: Explanations only as inline comments in the target language syntax.
