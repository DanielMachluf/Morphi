# gpt_service.py
# Central OpenAI chat-completion wrapper.
# Follows the same class-based pattern as all other services.

from models.gpt_model import GptRequest, GptResponse, client
from utils.models_config import TITLE_MODEL


class GptService:

    # Ctor — initializes the OpenAI client once per instance.
    # The client reads OPENAI_API_KEY from your .env automatically.
    def __init__(self) -> None:
        self.client = client

    # Send a chat completion request to OpenAI and return a typed GptResponse.
    # This is the core method — called by MessagesService.send_message().
    # model and messages come from the conversation row + full history payload.
    def complete(self, request: GptRequest) -> GptResponse:
        request.validate_model()

        response = self.client.chat.completions.create(
            model    = request.model,
            messages = [m.model_dump() for m in request.messages]  # type: ignore
        )

        return GptResponse(
            content     = response.choices[0].message.content or "",
            token_count = response.usage.total_tokens if response.usage else 0
        )

    # Ask GPT to generate a short title based on the user's first message.
    # Uses TITLE_MODEL (gpt-4o-mini) — title generation is simple and cheap.
    # Called by MessagesService after the first AI response in a new conversation.
    def generate_title(self, first_user_message: str) -> str:
        response = self.client.chat.completions.create(
            model = TITLE_MODEL,
            messages = [
                {
                    "role": "system",
                    "content": (
                        "You generate short conversation titles. "
                        "Return ONLY the title — no quotes, no punctuation, no explanation. "
                        "Maximum 5 words."
                    )
                },
                {
                    "role": "user",
                    "content": f"Generate a title for a conversation that started with: {first_user_message}"
                }
            ],
            max_tokens = 20     # titles are short — cap it to avoid any long responses
        )

        return (response.choices[0].message.content or "").strip()

    # Closing — GptService is stateless (no DB session), nothing to release.
    def close(self):
        pass

    # Enable with:
    def __enter__(self):
        return self

    # Exit with:
    def __exit__(self, exc_type, exc, tb):
        pass
