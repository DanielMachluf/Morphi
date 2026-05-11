# message_model.py

from typing import Optional, Literal
from sqlalchemy import Column, Integer, String, Text, text
from utils.dal import BaseModel
from pydantic import BaseModel as BaseSchema, Field


# Message schema for receiving REST API body:
class MessageSchema(BaseSchema):
    id: Optional[int] = None
    conversation_id: int = Field(ge=1)                 # must reference a valid conversation
    role: Literal['user', 'assistant', 'system']       # maps 1:1 to OpenAI API roles
    content: str = Field(min_length=1)                 # no blank messages
    token_count: Optional[int] = Field(default=None, ge=1)  # positive if provided, else None
    message_type: Optional[Literal['text', 'voice', 'pdf', 'image']] = 'text'
    file_url: Optional[str] = None


# Message model for accessing MySQL:
class MessageModel(BaseModel):

    # Database table:
    __tablename__ = "messages"

    # Table columns:
    id              = Column(Integer, primary_key=True)
    conversation_id = Column(Integer, nullable=False)  # FK → conversations.id (CASCADE in DB)
    role            = Column(String(20), nullable=False)   # 'user' | 'assistant' | 'system'
    content         = Column(Text, nullable=False)
    token_count     = Column(Integer, nullable=True)   # optional, from OpenAI usage response
    message_type    = Column(String(20), nullable=False, default='text')
    file_url        = Column(String(500), nullable=True)
    created_at      = Column(String(50), server_default=text("CURRENT_TIMESTAMP")) # type: ignore
