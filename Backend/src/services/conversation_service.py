


from fastapi import HTTPException ,status 
from models .conversation_model import ConversationModel ,ConversationSchema 
from utils .models_config import ALLOWED_MODELS 
from utils .dal import Dal 


class ConversationService :


    def __init__ (self )->None :
        self .dal =Dal ()
        self .session =self .dal .create_session ()




    def get_all_conversations (self ):
        conversations =self .session .query (ConversationModel ).filter (
        ConversationModel .status =="active"
        ).order_by (
        ConversationModel .updated_at .desc ()
        ).all ()

        return conversations 




    def get_conversation_by_id (self ,conversation_id :int )->ConversationModel :
        conversation =self .session .query (ConversationModel ).filter (
        ConversationModel .id ==conversation_id 
        ).first ()

        if not conversation :
            raise HTTPException (status_code =status .HTTP_404_NOT_FOUND ,
            detail =f"Conversation with id {conversation_id } not found")

        return conversation 




    def create_conversation (self ,schema :ConversationSchema )->ConversationModel :

        if schema .model not in ALLOWED_MODELS :
            raise HTTPException (status_code =status .HTTP_400_BAD_REQUEST ,
            detail =f"Invalid model. Choose from: {ALLOWED_MODELS }")

        conversation =ConversationModel ()
        conversation .persona_id =schema .persona_id  # type: ignore
        conversation .title ="New conversation" # type: ignore
        conversation .model =schema .model  # type: ignore
        conversation .status ="active" # type: ignore

        self .session .add (conversation )
        self .session .commit ()
        self .session .refresh (conversation )

        return conversation 




    def update_conversation_title (self ,conversation_id :int ,new_title :str )->ConversationModel :
        conversation =self .get_conversation_by_id (conversation_id )


        if not new_title or not new_title .strip ():
            raise HTTPException (status_code =status .HTTP_400_BAD_REQUEST ,
            detail ="Title cannot be empty")

        conversation .title =new_title .strip () # type: ignore

        self .session .commit ()
        self .session .refresh (conversation )

        return conversation 



    def archive_conversation (self ,conversation_id :int )->ConversationModel :
        conversation =self .get_conversation_by_id (conversation_id )
        conversation .status ="archived" # type: ignore

        self .session .commit ()
        self .session .refresh (conversation )

        return conversation 



    def delete_conversation (self ,conversation_id :int )->None :
        conversation =self .get_conversation_by_id (conversation_id )
        self .session .delete (conversation )
        self .session .commit ()


    def close (self ):
        self .session .close ()


    def __enter__ (self ):
        return self 


    def __exit__ (self ,exc_type ,exc ,tb ):
        self .session .close ()