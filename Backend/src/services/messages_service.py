# messages_service.py
# Handles all chat DB operations and orchestrates the send-message flow.
# Chat completions are delegated to GptService; this file never imports openai directly.

from typing import Any, Optional
from fastapi import HTTPException, status
from models.messages_model import MessageModel, MessageSchema
from models.conversation_model import ConversationModel
from models.persona_model import PersonaModel
from models.gpt_model import GptMessage, GptRequest
from services import file_service
from services.gpt_service import GptService
from utils.dal import Dal

# Number of messages in a conversation before we auto-generate a title.
# We wait for message 2 (1 user + 1 assistant = first exchange) so GPT has enough context.
TITLE_GENERATION_THRESHOLD = 2


class MessagesService:

    # Ctor:
    def __init__(self) -> None:
        self.dal = Dal()
        self.session = self.dal.create_session()
        self.gpt_service = GptService()

    # Get all messages for a conversation in chronological order (oldest first).
    # Called when user clicks a conversation in the sidebar to restore the chat history.
    def get_messages_by_conversation(self, conversation_id: int):
        messages = self.session.query(MessageModel).filter(
            MessageModel.conversation_id == conversation_id
        ).order_by(
            MessageModel.created_at.asc()   # oldest first — correct reading order
        ).all()

        return messages

    # The core method — orchestrates the entire chat flow:
    # 1. Save user message to DB
    # 2. Build full conversation history payload
    # 3. Call GptService to get AI response
    # 4. Save AI response to DB
    # 5. Auto-generate title if this is the first exchange
    # 6. Return AI response text
    def send_message(self, conversation_id: int, user_content: str) -> str:
        # Step 1 — Fetch the conversation to get the model locked in at creation.
        conversation = self.session.query(ConversationModel).filter(
            ConversationModel.id == conversation_id
        ).first()

        if not conversation:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail=f"Conversation {conversation_id} not found")

        # Step 2 — Build the full messages payload for OpenAI.
        # Pass the current user message directly so it is NOT read from the DB yet
        # (it hasn't been saved). This prevents duplicate saves on retries.
        gpt_messages = self._build_openai_payload(conversation_id, user_content)

        # Step 3 — Call GptService with the model and full history.
        gpt_request = GptRequest(model=conversation.model, messages=gpt_messages)  # type: ignore
        gpt_response = self.gpt_service.complete(gpt_request)

        # Step 4 — GPT succeeded: now save both messages together.
        # Saving here (after a successful API call) guarantees that a user message
        # is NEVER stored without its matching assistant response, so a failed
        # request cannot leave an orphaned message that duplicates on retry.
        self._save_message(conversation_id, "user", user_content)
        self._save_message(conversation_id, "assistant", gpt_response.content, gpt_response.token_count)

        # Step 6 — Auto-generate a smart title after the first AI response.
        # We count messages: if exactly 2 exist (1 user + 1 assistant = first exchange)
        # we ask GptService to generate a short title.
        message_count = self.session.query(MessageModel).filter(
            MessageModel.conversation_id == conversation_id
        ).count()

        if message_count == TITLE_GENERATION_THRESHOLD:
            self._generate_conversation_title(conversation_id, user_content)

        # Step 7 — Return the AI response text to the controller
        return gpt_response.content

    def send_message_stream(self, conversation_id: int, user_content: str):
        conversation = self.session.query(ConversationModel).filter(
            ConversationModel.id == conversation_id
        ).first()

        if not conversation:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail=f"Conversation {conversation_id} not found")

        gpt_messages = self._build_openai_payload(conversation_id, user_content)
        payload = [message.model_dump() for message in gpt_messages]

        response = self.gpt_service.client.chat.completions.create(
            model=conversation.model, # type: ignore
            messages=payload, # type: ignore
            stream=True
        )

        ai_content = ""
        for chunk in response:
            delta = chunk.choices[0].delta.content
            if delta:
                ai_content += delta
                yield delta

        self._save_message(conversation_id, "user", user_content)
        self._save_message(conversation_id, "assistant", ai_content, token_count=None)

        message_count = self.session.query(MessageModel).filter(
            MessageModel.conversation_id == conversation_id
        ).count()

        if message_count == TITLE_GENERATION_THRESHOLD:
            self._generate_conversation_title(conversation_id, user_content)

    def send_file_message(self, conversation_id: int, file: Any, filename: str, file_type: str,
                          user_text: str = "Please analyze this.") -> str:
        file_path = file_service.save_file(file, filename)
        b64 = None

        if file_type == "voice":
            transcription = file_service.transcribe_voice(file_path)
            user_content = f"[Voice Message]: {transcription}\n\nUser question: {user_text}"
        elif file_type == "pdf":
            text = file_service.extract_pdf_text(file_path)
            user_content = f"[PDF Content]: {text}\n\nUser question: {user_text}"
        elif file_type == "image":
            b64 = file_service.encode_image_base64(file_path)
            user_content = f"[Image]: {user_text}"
        else:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                                detail="file_type must be voice, pdf, or image")

        self._save_message(conversation_id, "user", user_content,
                           message_type=file_type, file_url=file_path)

        conversation = self.session.query(ConversationModel).filter(
            ConversationModel.id == conversation_id
        ).first()

        if not conversation:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail=f"Conversation {conversation_id} not found")

        gpt_messages = self._build_openai_payload(conversation_id)
        payload = [message.model_dump() for message in gpt_messages]

        if file_type == "image":
            payload.append({
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}},
                    {"type": "text", "text": user_text}
                ]
            })
            model = "gpt-4o"
        else:
            payload.append({"role": "user", "content": user_content})
            model = conversation.model

        response = self.gpt_service.client.chat.completions.create(
            model=model, # type: ignore
            messages=payload # type: ignore
        )

        ai_content = response.choices[0].message.content or ""
        token_count = response.usage.total_tokens if response.usage else 0

        self._save_message(conversation_id, "assistant", ai_content, token_count=token_count)

        return ai_content

    # ─────────────────────────────────────────────
    # PRIVATE HELPERS — only called inside this class
    # ─────────────────────────────────────────────

    # PRIVATE — Builds the messages list that OpenAI expects:
    # [system prompt, user msg 1, assistant msg 1, user msg 2, ...]
    # The system prompt comes from the persona attached to this conversation.
    # All previous messages come from the DB; current_user_message is appended
    # at the end without being saved yet, avoiding orphaned rows on failure.
    def _build_openai_payload(self, conversation_id: int,
                              current_user_message: Optional[str] = None) -> list[GptMessage]:
        conversation = self.session.query(ConversationModel).filter(
            ConversationModel.id == conversation_id
        ).first()

        persona = self.session.query(PersonaModel).filter(
            PersonaModel.id == conversation.persona_id  # type: ignore
        ).first()

        # Start with the system prompt — always first in the array
        payload = [
            GptMessage(role="system", content=persona.system_prompt)  # type: ignore
        ]

        # Append all previous messages in chronological order
        messages = self.session.query(MessageModel).filter(
            MessageModel.conversation_id == conversation_id
        ).order_by(
            MessageModel.created_at.asc()
        ).all()

        for message in messages:
            payload.append(GptMessage(role=message.role, content=message.content))  # type: ignore

        if current_user_message:
            # Append the current user message last (not yet in DB)
            payload.append(GptMessage(role="user", content=current_user_message))

        return payload

    # PRIVATE — Inserts a single message row into the messages table.
    # Called twice inside send_message(): once for user, once for assistant.
    # token_count is only provided when saving the assistant message.
    def _save_message(self, conversation_id: int, role: str, content: str,
                      token_count: Optional[int] = None,
                      message_type: str = 'text',
                      file_url: Optional[str] = None) -> None:
        message = MessageModel()
        message.conversation_id = conversation_id   # type: ignore
        message.role            = role              # type: ignore
        message.content         = content           # type: ignore
        message.token_count     = token_count       # type: ignore
        message.message_type    = message_type      # type: ignore
        message.file_url        = file_url          # type: ignore

        self.session.add(message)
        self.session.commit()

    # PRIVATE — Asks GptService to generate a short title from the first user message.
    # Runs only once per conversation — right after the first AI response.
    # Updates the conversation title in the DB directly.
    def _generate_conversation_title(self, conversation_id: int, first_user_message: str) -> None:
        generated_title = self.gpt_service.generate_title(first_user_message)

        conversation = self.session.query(ConversationModel).filter(
            ConversationModel.id == conversation_id
        ).first()

        if conversation:
            conversation.title = generated_title  # type: ignore
            self.session.commit()

    # Closing:
    def close(self):
        self.session.close()
        self.gpt_service.close()

    # Enable with:
    def __enter__(self):
        return self

    # Exit with:
    def __exit__(self, exc_type, exc, tb):
        self.session.close()
