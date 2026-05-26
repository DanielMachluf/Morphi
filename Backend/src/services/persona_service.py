


from fastapi import HTTPException ,status 
from models .persona_model import PersonaModel ,PersonaSchema 
from utils .dal import Dal 


class PersonaService :


    def __init__ (self )->None :
        self .dal =Dal ()
        self .session =self .dal .create_session ()



    def get_all_personas (self ):
        personas =self .session .query (PersonaModel ).all ()
        return personas 



    def get_persona_by_id (self ,persona_id :int )->PersonaModel :
        persona =self .session .query (PersonaModel ).filter (
        PersonaModel .id ==persona_id 
        ).first ()

        if not persona :
            raise HTTPException (status_code =status .HTTP_404_NOT_FOUND ,
            detail =f"Persona with id {persona_id } not found")

        return persona 



    def create_persona (self ,schema :PersonaSchema )->PersonaModel :
        persona =PersonaModel ()
        persona .name =schema .name  # type: ignore
        persona .system_prompt =schema .system_prompt  # type: ignore
        persona .is_default =False  # type: ignore

        self .session .add (persona )
        self .session .commit ()
        self .session .refresh (persona )

        return persona 



    def update_persona (self ,persona_id :int ,schema :PersonaSchema )->PersonaModel :
        persona =self .get_persona_by_id (persona_id )


        if persona .is_default : # type: ignore
            raise HTTPException (status_code =status .HTTP_403_FORBIDDEN ,
            detail ="System default personas cannot be edited")

        persona .name =schema .name  # type: ignore
        persona .system_prompt =schema .system_prompt  # type: ignore

        self .session .commit ()
        self .session .refresh (persona )

        return persona 




    def delete_persona (self ,persona_id :int )->None :
        persona =self .get_persona_by_id (persona_id )


        if persona .is_default : # type: ignore
            raise HTTPException (status_code =status .HTTP_403_FORBIDDEN ,
            detail ="System default personas cannot be deleted")

        self .session .delete (persona )
        self .session .commit ()


    def close (self ):
        self .session .close ()


    def __enter__ (self ):
        return self 


    def __exit__ (self ,exc_type ,exc ,tb ):
        self .session .close ()