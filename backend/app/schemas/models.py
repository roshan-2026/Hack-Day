from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class LanguageDetectRequest(BaseModel):
    source_code: str = Field(..., description="The source code to detect language from", min_length=1)

class LanguageDetectResponse(BaseModel):
    detected_language: str
    confidence: float
    status: str  # "detected" | "ambiguous" | "unknown"
    explanation: Optional[str] = None
    scores: Optional[Dict[str, float]] = None

class ConvertRequest(BaseModel):
    source_code: str = Field(..., description="Source code to convert", min_length=1)
    source_language: Optional[str] = Field(None, description="Source language if known or pre-detected")
    target_language: str = Field(..., description="Target language to convert to")
    custom_instructions: Optional[str] = Field(None, description="Optional custom instructions for conversion")
    api_key: Optional[str] = Field(None, description="Optional user-provided Gemini API key")

class ConvertResponse(BaseModel):
    converted_code: str
    detected_language: str
    target_language: str
    conversion_status: str  # "success" | "warning" | "failed"
    notes: Optional[str] = None
    error: Optional[str] = None
    used_model: Optional[str] = None

class ExecutionLimits(BaseModel):
    timeout_seconds: Optional[int] = 10
    memory_limit_mb: Optional[int] = 128

class ExecuteRequest(BaseModel):
    source_code: str = Field(..., description="Code to execute", min_length=1)
    language: str = Field(..., description="Language of the code")
    stdin: Optional[str] = Field("", description="Standard input to pass to the program")
    execution_limits: Optional[ExecutionLimits] = None

class ExecuteResponse(BaseModel):
    stdout: str = ""
    stderr: str = ""
    exit_code: int = 0
    execution_time_ms: float = 0.0
    memory_kb: int = 0
    status: str  # "COMPLETED" | "COMPILE_ERROR" | "RUNTIME_ERROR" | "TIMEOUT" | "FAILED"
    runner_used: Optional[str] = None
    error_message: Optional[str] = None

class TestCaseInput(BaseModel):
    name: Optional[str] = "Test Case"
    stdin: str = ""
    description: Optional[str] = None

class TestCaseResult(BaseModel):
    test_id: int
    name: str
    stdin: str
    expected_output: str
    actual_output: str
    passed: bool
    status: str  # "PASSED" | "FAILED" | "RUNTIME_ERROR" | "TIMEOUT"
    error_message: Optional[str] = None
    execution_time_ms: float = 0.0

class EquivalenceTestRequest(BaseModel):
    original_code: str = Field(..., description="Original source code")
    converted_code: str = Field(..., description="Converted target code")
    source_language: str = Field(..., description="Source programming language")
    target_language: str = Field(..., description="Target programming language")
    test_cases: Optional[List[TestCaseInput]] = Field(None, description="Optional user-provided test inputs")
    auto_generate: bool = Field(True, description="Whether to auto-generate test cases if needed")
    api_key: Optional[str] = None

class EquivalenceTestResponse(BaseModel):
    total_tests: int
    passed_tests: int
    failed_tests: int
    test_results: List[TestCaseResult]
    equivalence_status: str  # "PASSED" | "PARTIALLY_PASSED" | "FAILED" | "NOT_VERIFIED"
    summary: str
    original_compile_status: Optional[str] = "OK"
    converted_compile_status: Optional[str] = "OK"

class ExplainRequest(BaseModel):
    source_code: str = Field(..., description="Code to explain with inline comments")
    language: str = Field(..., description="Language of the code")
    api_key: Optional[str] = None

class ExplainResponse(BaseModel):
    explained_code: str
    language: str

class AutoCorrectRequest(BaseModel):
    original_code: str
    converted_code: str
    source_language: str
    target_language: str
    error_details: str
    failed_test_input: Optional[str] = None
    expected_output: Optional[str] = None
    actual_output: Optional[str] = None
    custom_instructions: Optional[str] = None
    max_retries: int = 3
    api_key: Optional[str] = None

class AutoCorrectResponse(BaseModel):
    corrected_code: str
    attempts: int
    succeeded: bool
    test_results: Optional[EquivalenceTestResponse] = None
    explanation: Optional[str] = None
