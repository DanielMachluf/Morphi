# conversation_service.py
# Handles conversation lifecycle — create, fetch, update title, archive, delete

from fastapi import HTTPException, status
from models.conversation_model import ConversationModel, ConversationSchema
from utils.models_config import ALLOWED_MODELS
from utils.dal import Dal


class ConversationService:

    # Ctor:
    def __init__(self) -> None:
        self.dal = Dal()
        self.session = self.dal.create_session()

    # Get all active conversations sorted by updated_at DESC.
    # This powers the sidebar — most recent conversation appears first.
    # Only returns 'active' conversations — archived ones are hidden from sidebar.
    def get_all_conversations(self):
        conversations = self.session.query(ConversationModel).filter(
            ConversationModel.status == "active"
        ).order_by(
            ConversationModel.updated_at.desc()
        ).all()

        return conversations

    # Get one conversation by ID.
    # Used when the user clicks a conversation in the sidebar to restore it.
    # Messages are fetched separately via MessagesService.
    def get_conversation_by_id(self, conversation_id: int) -> ConversationModel:
        conversation = self.session.query(ConversationModel).filter(
            ConversationModel.id == conversation_id
        ).first()

        if not conversation:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail=f"Conversation with id {conversation_id} not found")

        return conversation

    # Create a new conversation when user clicks 'New Chat'.
    # Title starts as 'New conversation' — GPT replaces it after the first exchange.
    # Model and persona are locked in at creation time.
    def create_conversation(self, schema: ConversationSchema) -> ConversationModel:
        # Validate model before saving — extra safety on top of DB CHECK constraint
        if schema.model not in ALLOWED_MODELS:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail=f"Invalid model. Choose from: {ALLOWED_MODELS}")

        conversation = ConversationModel()
        conversation.persona_id = schema.persona_id  # type: ignore
        conversation.title      = "New conversation"  # type: ignore
        conversation.model      = schema.model         # type: ignore
        conversation.status     = "active"             # type: ignore

        self.session.add(conversation)
        self.session.commit()
        self.session.refresh(conversation)

        return conversation

    # Update conversation title after GPT auto-generates it.
    # Called from MessagesService after the first AI response —
    # NOT directly by the user.
    def update_conversation_title(self, conversation_id: int, new_title: str) -> ConversationModel:
        conversation = self.get_conversation_by_id(conversation_id)

        # Guard: title must not be empty or just whitespace
        if not new_title or not new_title.strip():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail="Title cannot be empty")

        conversation.title = new_title.strip()  # type: ignore

        self.session.commit()
        self.session.refresh(conversation)

        return conversation

    # Soft-delete a conversation — sets status to 'archived'.
    # The conversation still exists in the DB but disappears from the sidebar.
    def archive_conversation(self, conversation_id: int) -> ConversationModel:
        conversation = self.get_conversation_by_id(conversation_id)
        conversation.status = "archived"  # type: ignore

        self.session.commit()
        self.session.refresh(conversation)

        return conversation

    # Hard-delete a conversation permanently.
    # ON DELETE CASCADE in the DB schema automatically deletes all messages too.
    def delete_conversation(self, conversation_id: int) -> None:
        conversation = self.get_conversation_by_id(conversation_id)
        self.session.delete(conversation)
        self.session.commit()

    # Closing:
    def close(self):
        self.session.close()

    # Enable with:
    def __enter__(self):
        return self

    # Exit with:
    def __exit__(self, exc_type, exc, tb):
        self.session.close()