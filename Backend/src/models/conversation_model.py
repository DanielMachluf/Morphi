# conversation_model.py

from typing import Optional, Literal
from sqlalchemy import Column, Integer, String , text
from utils.models_config import ALLOWED_MODELS
from utils.dal import BaseModel
from pydantic import BaseModel as BaseSchema, Field


# Allowed models — single source of truth, used in validation



# Conversation schema for receiving REST API body:
class ConversationSchema(BaseSchema):
    id: Optional[int] = None
    persona_id: int = Field(ge=1)                      # must reference a valid persona
    title: Optional[str] = Field(default='New conversation', min_length=1, max_length=255)
    model: Optional[str] = Field(default='gpt-4o')
    status: Optional[Literal['active', 'archived']] = 'active'  # only 2 valid values

    # Validate model is one of the allowed values
    def validate_model(self):
        if self.model not in ALLOWED_MODELS:
            raise ValueError(f"model must be one of: {ALLOWED_MODELS}")


# Conversation model for accessing MySQL:
class ConversationModel(BaseModel):

    # Database table:
    __tablename__ = "conversations"

    # Table columns:
    id         = Column(Integer, primary_key=True)
    persona_id = Column(Integer, nullable=False)       # FK handled in DB schema
    title      = Column(String(255), nullable=False, default='New conversation')
    model      = Column(String(50), nullable=False, default='gpt-4o')
    status     = Column(String(20), nullable=False, default='active')  # ENUM comes as string
    created_at = Column(String(50), server_default=text("CURRENT_TIMESTAMP")) # type: ignore
    updated_at = Column(String(50), server_default=text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")) # type: ignore