# persona_service.py
# Handles all persona CRUD operations — no AI logic here

from fastapi import HTTPException, status
from models.persona_model import PersonaModel, PersonaSchema
from utils.dal import Dal


class PersonaService:

    # Ctor:
    def __init__(self) -> None:
        self.dal = Dal()
        self.session = self.dal.create_session()

    # Get all personas — both system defaults and user-created.
    # The frontend uses is_default to separate them into two sections.
    def get_all_personas(self):
        personas = self.session.query(PersonaModel).all()
        return personas

    # Get one persona by ID.
    # Called before starting a conversation to fetch the system_prompt.
    def get_persona_by_id(self, persona_id: int) -> PersonaModel:
        persona = self.session.query(PersonaModel).filter(
            PersonaModel.id == persona_id
        ).first()

        if not persona:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail=f"Persona with id {persona_id} not found")

        return persona

    # Create a new user-defined persona.
    # is_default is always forced to False — only seeded DB personas can be defaults.
    def create_persona(self, schema: PersonaSchema) -> PersonaModel:
        persona = PersonaModel()
        persona.name          = schema.name           # type: ignore
        persona.system_prompt = schema.system_prompt  # type: ignore
        persona.is_default    = False                 # type: ignore

        self.session.add(persona)
        self.session.commit()
        self.session.refresh(persona)

        return persona

    # Update an existing persona's name and/or system_prompt.
    # Blocks editing of system default presets.
    def update_persona(self, persona_id: int, schema: PersonaSchema) -> PersonaModel:
        persona = self.get_persona_by_id(persona_id)

        # Guard: never allow editing system presets
        if persona.is_default:  # type: ignore
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                                detail="System default personas cannot be edited")

        persona.name          = schema.name           # type: ignore
        persona.system_prompt = schema.system_prompt  # type: ignore

        self.session.commit()
        self.session.refresh(persona)

        return persona

    # Delete a user-created persona.
    # Blocks deletion of system defaults.
    # Also blocked at DB level via ON DELETE RESTRICT on conversations FK.
    def delete_persona(self, persona_id: int) -> None:
        persona = self.get_persona_by_id(persona_id)

        # Guard: never allow deleting system presets
        if persona.is_default:  # type: ignore
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                                detail="System default personas cannot be deleted")

        self.session.delete(persona)
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