# conversation_controller.py
# REST endpoints for conversation lifecycle — create, fetch, update title, archive, delete

from fastapi import APIRouter, status
from pydantic import BaseModel, Field
from models.conversation_model import ConversationSchema
from services.conversation_service import ConversationService

router = APIRouter()


# Request body schema for PATCH title endpoint
class TitleUpdateSchema(BaseModel):
    new_title: str = Field(min_length=1, max_length=255)


@router.get("/api/conversations")
def get_all_conversations():
    with ConversationService() as service:
        return service.get_all_conversations()


@router.get("/api/conversations/{id}")
def get_conversation_by_id(id: int):
    with ConversationService() as service:
        return service.get_conversation_by_id(id)


@router.post("/api/conversations", status_code=status.HTTP_201_CREATED)
def create_conversation(conversation_schema: ConversationSchema):
    with ConversationService() as service:
        return service.create_conversation(conversation_schema)


@router.patch("/api/conversations/{id}/title")
def update_conversation_title(id: int, body: TitleUpdateSchema):
    with ConversationService() as service:
        return service.update_conversation_title(id, body.new_title)


@router.patch("/api/conversations/{id}/archive")
def archive_conversation(id: int):
    with ConversationService() as service:
        return service.archive_conversation(id)


@router.delete("/api/conversations/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_conversation(id: int):
    with ConversationService() as service:
        service.delete_conversation(id)
