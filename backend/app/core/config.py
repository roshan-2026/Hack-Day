import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

# Load .env from backend folder
BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env", override=True)

class Settings:
    PROJECT_NAME: str = "Cross-Language Code Translation"
    VERSION: str = "1.0.0"
    
    # LLM Settings
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    DEFAULT_GEMINI_MODEL: str = "gemini-3.1-flash-lite"
    CANDIDATE_GEMINI_MODELS: List[str] = [
        "gemini-3.1-flash-lite",
        "gemini-3.5-flash",
        "gemini-3.8-flash"
    ]
    
    # Execution Runner Settings
    EXECUTION_PROVIDER: str = os.getenv("EXECUTION_PROVIDER", "auto")
    
    # Judge0 Settings
    JUDGE0_URL: str = os.getenv("JUDGE0_URL", "https://ce.judge0.com").rstrip("/")
    JUDGE0_API_KEY: str = os.getenv("JUDGE0_API_KEY", "")
    JUDGE0_HOST: str = os.getenv("JUDGE0_HOST", "")
    
    # Piston Settings
    PISTON_URL: str = os.getenv("PISTON_URL", "https://emkc.org/api/v2/piston").rstrip("/")
    PISTON_API_KEY: str = os.getenv("PISTON_API_KEY", "")
    
    # Execution Limits
    EXECUTION_TIMEOUT_SECONDS: int = int(os.getenv("EXECUTION_TIMEOUT_SECONDS", "10"))
    MEMORY_LIMIT_MB: int = int(os.getenv("MEMORY_LIMIT_MB", "128"))
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

settings = Settings()
