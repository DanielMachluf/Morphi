# persona_controller.py
# REST endpoints for persona CRUD — maps HTTP routes to PersonaService methods

from fastapi import APIRouter, status
from models.persona_model import PersonaSchema
from services.persona_service import PersonaService

router = APIRouter()


@router.get("/api/personas")
def get_all_personas():
    with PersonaService() as service:
        return service.get_all_personas()


@router.get("/api/personas/{id}")
def get_persona_by_id(id: int):
    with PersonaService() as service:
        return service.get_persona_by_id(id)


@router.post("/api/personas", status_code=status.HTTP_201_CREATED)
def create_persona(persona_schema: PersonaSchema):
    with PersonaService() as service:
        return service.create_persona(persona_schema)


@router.put("/api/personas/{id}")
def update_persona(id: int, persona_schema: PersonaSchema):
    with PersonaService() as service:
        return service.update_persona(id, persona_schema)


@router.delete("/api/personas/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_persona(id: int):
    with PersonaService() as service:
        service.delete_persona(id)
