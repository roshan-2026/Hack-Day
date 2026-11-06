import logging
from fastapi import APIRouter, HTTPException, Depends
from app.schemas.models import (
    LanguageDetectRequest,
    LanguageDetectResponse,
    ConvertRequest,
    ConvertResponse,
    ExecuteRequest,
    ExecuteResponse,
    EquivalenceTestRequest,
    EquivalenceTestResponse,
    ExplainRequest,
    ExplainResponse,
    AutoCorrectRequest,
    AutoCorrectResponse
)
from app.services.language_detector import LanguageDetector
from app.services.conversion_engine import ConversionEngine
from app.services.equivalence_tester import EquivalenceTester
from app.services.correction_engine import CorrectionEngine
from app.services.code_explainer import CodeExplainer
from app.execution import get_runner
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api")

@router.get("/health")
async def health_check():
    runner = get_runner()
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "execution_provider": settings.EXECUTION_PROVIDER,
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "supported_languages": [
            {"id": "c", "name": "C", "extension": ".c"},
            {"id": "cpp", "name": "C++", "extension": ".cpp"},
            {"id": "java", "name": "Java", "extension": ".java"},
            {"id": "python", "name": "Python", "extension": ".py"},
            {"id": "javascript", "name": "JavaScript", "extension": ".js"},
            {"id": "typescript", "name": "TypeScript", "extension": ".ts"},
            {"id": "csharp", "name": "C#", "extension": ".cs"},
            {"id": "go", "name": "Go", "extension": ".go"},
            {"id": "rust", "name": "Rust", "extension": ".rs"},
            {"id": "php", "name": "PHP", "extension": ".php"},
            {"id": "ruby", "name": "Ruby", "extension": ".rb"},
            {"id": "kotlin", "name": "Kotlin", "extension": ".kt"},
            {"id": "swift", "name": "Swift", "extension": ".swift"},
            {"id": "dart", "name": "Dart", "extension": ".dart"},
            {"id": "r", "name": "R", "extension": ".r"},
            {"id": "julia", "name": "Julia", "extension": ".jl"},
            {"id": "scala", "name": "Scala", "extension": ".scala"},
            {"id": "perl", "name": "Perl", "extension": ".pl"},
            {"id": "lua", "name": "Lua", "extension": ".lua"},
            {"id": "bash", "name": "Bash", "extension": ".sh"}
        ]
    }

@router.post("/detect-language", response_model=LanguageDetectResponse)
async def detect_language(req: LanguageDetectRequest):
    try:
        res = LanguageDetector.detect(req.source_code)
        return LanguageDetectResponse(**res)
    except Exception as e:
        logger.error(f"Error during language detection: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/convert", response_model=ConvertResponse)
async def convert_code(req: ConvertRequest):
    try:
        # Detect source language if omitted
        src_lang = req.source_language
        detected_res = None
        if not src_lang or src_lang == "unknown":
            detected_res = LanguageDetector.detect(req.source_code)
            src_lang = detected_res.get("detected_language", "unknown")

        converted_code, status, note = await ConversionEngine.convert(
            source_code=req.source_code,
            source_language=src_lang,
            target_language=req.target_language,
            custom_instructions=req.custom_instructions,
            api_key=req.api_key
        )

        return ConvertResponse(
            converted_code=converted_code,
            detected_language=src_lang,
            target_language=req.target_language,
            conversion_status=status,
            notes=note
        )
    except Exception as e:
        logger.error(f"Error during conversion: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/execute", response_model=ExecuteResponse)
async def execute_code(req: ExecuteRequest):
    try:
        runner = get_runner()
        timeout = 10
        mem = 128
        if req.execution_limits:
            timeout = req.execution_limits.timeout_seconds or 10
            mem = req.execution_limits.memory_limit_mb or 128

        res = await runner.execute(
            source_code=req.source_code,
            language=req.language,
            stdin=req.stdin or "",
            timeout_seconds=timeout,
            memory_limit_mb=mem
        )

        # Ensure that if execution failed or had errors, stderr is never blank
        out = res.stdout or ""
        err = res.stderr or ""
        if not out and not err and res.error_message:
            err = res.error_message

        return ExecuteResponse(
            stdout=out,
            stderr=err,
            exit_code=res.exit_code,
            execution_time_ms=res.execution_time_ms,
            memory_kb=res.memory_kb,
            status=res.status,
            runner_used=res.runner_used,
            error_message=res.error_message
        )
    except Exception as e:
        logger.error(f"Error during code execution: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/test-equivalence", response_model=EquivalenceTestResponse)
async def test_equivalence(req: EquivalenceTestRequest):
    try:
        res = await EquivalenceTester.run_tests(
            original_code=req.original_code,
            converted_code=req.converted_code,
            source_language=req.source_language,
            target_language=req.target_language,
            user_test_cases=req.test_cases,
            auto_generate=req.auto_generate
        )
        return res
    except Exception as e:
        logger.error(f"Error during equivalence testing: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/explain", response_model=ExplainResponse)
async def explain_code(req: ExplainRequest):
    try:
        explained = await CodeExplainer.explain(
            source_code=req.source_code,
            language=req.language,
            api_key=req.api_key
        )
        return ExplainResponse(explained_code=explained, language=req.language)
    except Exception as e:
        logger.error(f"Error during code explanation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/auto-correct", response_model=AutoCorrectResponse)
async def auto_correct(req: AutoCorrectRequest):
    try:
        res = await CorrectionEngine.auto_correct(
            original_code=req.original_code,
            converted_code=req.converted_code,
            source_language=req.source_language,
            target_language=req.target_language,
            error_details=req.error_details,
            failed_test_input=req.failed_test_input,
            expected_output=req.expected_output,
            actual_output=req.actual_output,
            custom_instructions=req.custom_instructions,
            max_retries=req.max_retries,
            api_key=req.api_key
        )
        return res
    except Exception as e:
        logger.error(f"Error during auto correction: {e}")
        raise HTTPException(status_code=500, detail=str(e))
