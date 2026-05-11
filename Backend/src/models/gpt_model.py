# gpt_model.py
# Pydantic schemas for all GPT / OpenAI-related data structures.
# These are NOT database models — GPT calls are stateless and need no table.
# Used as typed contracts between gpt_service and the rest of the app.

import os
from typing import Literal, List
from openai import OpenAI
from pydantic import BaseModel as BaseSchema, Field
from utils.models_config import ALLOWED_MODELS, DEFAULT_MODEL, TITLE_MODEL


client = OpenAI(api_key=os.getenv("OPENAI_API_KEY") or "missing-openai-api-key")


# A single message in the OpenAI messages array.
# Maps 1:1 to the format OpenAI expects: { "role": "...", "content": "..." }
class GptMessage(BaseSchema):
    role: Literal["system", "user", "assistant"]
    content: str = Field(min_length=1)


# The full request payload sent to OpenAI chat completions.
# model must be one of the values defined in models_config.py.
class GptRequest(BaseSchema):
    model: str = Field(default=DEFAULT_MODEL)
    messages: List[GptMessage]

    # Validate model against the allowed list from models_config.py
    def validate_model(self):
        if self.model not in ALLOWED_MODELS:
            raise ValueError(f"model must be one of: {ALLOWED_MODELS}")


# The structured response returned by gpt_service after a chat completion call.
# Wraps the raw OpenAI response into a clean, typed object.
class GptResponse(BaseSchema):
    content: str                    # the AI's reply text
    token_count: int                # total tokens consumed (from response.usage)
