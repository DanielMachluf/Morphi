# persona_model.py

from typing import Optional
from sqlalchemy import Column, Integer, String, Text, Boolean, text
from utils.dal import BaseModel
from pydantic import BaseModel as BaseSchema, Field


# Persona schema for receiving REST API body:
class PersonaSchema(BaseSchema):
    id: Optional[int] = None
    name: str = Field(min_length=2, max_length=100)
    system_prompt: str = Field(min_length=10)          # too short = useless prompt
    is_default: Optional[bool] = False                 # user-created personas default to False


# Persona model for accessing MySQL:
class PersonaModel(BaseModel):

    # Database table:
    __tablename__ = "personas"

    # Table columns:
    id         = Column(Integer, primary_key=True)
    name       = Column(String(100), nullable=False, unique=True)
    system_prompt = Column(Text, nullable=False)
    is_default = Column(Boolean, nullable=False, default=False)
    created_at = Column(String(50), server_default=text("CURRENT_TIMESTAMP"))                    # TIMESTAMP comes as string from MySQL