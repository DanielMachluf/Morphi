



from typing import Any ,Optional 
from fastapi import HTTPException ,status 
from models .messages_model import MessageModel ,MessageSchema 
from models .conversation_model import ConversationModel 
from models .persona_model import PersonaModel 
from models .gpt_model import GptMessage ,GptRequest 
from services import file_service 
from services .gpt_service import GptService 
from utils .dal import Dal 



TITLE_GENERATION_THRESHOLD =2 


class MessagesService :


    def __init__ (self )->None :
        self .dal =Dal ()
        self .session =self .dal .create_session ()
        self .gpt_service =GptService ()



    def get_messages_by_conversation (self ,conversation_id :int ):
        messages =self .session .query (MessageModel ).filter (
        MessageModel .conversation_id ==conversation_id 
        ).order_by (
        MessageModel .created_at .asc ()
        ).all ()

        return messages 








    def send_message (self ,conversation_id :int ,user_content :str )->str :

        conversation =self .session .query (ConversationModel ).filter (
        ConversationModel .id ==conversation_id 
        ).first ()

        if not conversation :
            raise HTTPException (status_code =status .HTTP_404_NOT_FOUND ,
            detail =f"Conversation {conversation_id } not found")




        gpt_messages =self ._build_openai_payload (conversation_id ,user_content )


        gpt_request =GptRequest (model =conversation .model ,messages =gpt_messages ) # type: ignore
        gpt_response =self .gpt_service .complete (gpt_request )





        self ._save_message (conversation_id ,"user",user_content )
        self ._save_message (conversation_id ,"assistant",gpt_response .content ,gpt_response .token_count )




        message_count =self .session .query (MessageModel ).filter (
        MessageModel .conversation_id ==conversation_id 
        ).count ()

        if message_count ==TITLE_GENERATION_THRESHOLD :
            self ._generate_conversation_title (conversation_id ,user_content )


        return gpt_response .content 

    def send_message_stream (self ,conversation_id :int ,user_content :str ):
        conversation =self .session .query (ConversationModel ).filter (
        ConversationModel .id ==conversation_id 
        ).first ()

        if not conversation :
            raise HTTPException (status_code =status .HTTP_404_NOT_FOUND ,
            detail =f"Conversation {conversation_id } not found")

        gpt_messages =self ._build_openai_payload (conversation_id ,user_content )
        payload =[message .model_dump ()for message in gpt_messages ]

        response =self .gpt_service .client .chat .completions .create ( # type: ignore
        model =conversation .model , # type: ignore
        messages =payload , # type: ignore
        stream =True 
        )

        ai_content =""
        for chunk in response :
            delta =chunk .choices [0 ].delta .content 
            if delta :
                ai_content +=delta 
                yield delta 

        self ._save_message (conversation_id ,"user",user_content )
        self ._save_message (conversation_id ,"assistant",ai_content ,token_count =None )

        message_count =self .session .query (MessageModel ).filter (
        MessageModel .conversation_id ==conversation_id 
        ).count ()

        if message_count ==TITLE_GENERATION_THRESHOLD :
            self ._generate_conversation_title (conversation_id ,user_content )

    def send_file_message (self ,conversation_id :int ,file :Any ,filename :str ,file_type :str ,
    user_text :str ="Please analyze this.")->str :
        file_path =file_service .save_file (file ,filename )
        b64 =None 

        if file_type =="voice":
            transcription =file_service .transcribe_voice (file_path )
            user_content =f"[Voice Message]: {transcription }\n\nUser question: {user_text }"
        elif file_type =="pdf":
            text =file_service .extract_pdf_text (file_path )
            user_content =f"[PDF Content]: {text }\n\nUser question: {user_text }"
        elif file_type =="image":
            b64 =file_service .encode_image_base64 (file_path )
            user_content =f"[Image]: {user_text }"
        else :
            raise HTTPException (status_code =status .HTTP_422_UNPROCESSABLE_ENTITY ,
            detail ="file_type must be voice, pdf, or image")

        self ._save_message (conversation_id ,"user",user_content ,
        message_type =file_type ,file_url =file_path )

        conversation =self .session .query (ConversationModel ).filter (
        ConversationModel .id ==conversation_id 
        ).first ()

        if not conversation :
            raise HTTPException (status_code =status .HTTP_404_NOT_FOUND ,
            detail =f"Conversation {conversation_id } not found")

        gpt_messages =self ._build_openai_payload (conversation_id )
        payload =[message .model_dump ()for message in gpt_messages ]

        if file_type =="image":
            payload .append ({
            "role":"user",
            "content":[
            {"type":"image_url","image_url":{"url":f"data:image/jpeg;base64,{b64 }"}},
            {"type":"text","text":user_text }
            ]
            })
            model ="gpt-4o"
        else :
            payload .append ({"role":"user","content":user_content })
            model =conversation .model 

        response =self .gpt_service .client .chat .completions .create (
        model =model , # type: ignore
        messages =payload # type: ignore
        )

        ai_content =response .choices [0 ].message .content or ""
        token_count =response .usage .total_tokens if response .usage else 0 

        self ._save_message (conversation_id ,"assistant",ai_content ,token_count =token_count )

        return ai_content 










    def _build_openai_payload (self ,conversation_id :int ,
    current_user_message :Optional [str ]=None )->list [GptMessage ]:
        conversation =self .session .query (ConversationModel ).filter (
        ConversationModel .id ==conversation_id 
        ).first ()

        persona =self .session .query (PersonaModel ).filter (
        PersonaModel .id ==conversation .persona_id # type: ignore
        ).first ()


        payload =[
        GptMessage (role ="system",content =persona .system_prompt ) # type: ignore
        ]


        messages =self .session .query (MessageModel ).filter (
        MessageModel .conversation_id ==conversation_id 
        ).order_by (
        MessageModel .created_at .asc ()
        ).all ()

        for message in messages :
            payload .append (GptMessage (role =message .role ,content =message .content )) # type: ignore

        if current_user_message :

            payload .append (GptMessage (role ="user",content =current_user_message ))

        return payload 




    def _save_message (self ,conversation_id :int ,role :str ,content :str ,
    token_count :Optional [int ]=None ,
    message_type :str ='text',
    file_url :Optional [str ]=None )->None :
        message =MessageModel ()
        message .conversation_id =conversation_id # type: ignore
        message .role =role # type: ignore
        message .content =content # type: ignore
        message .token_count =token_count # type: ignore
        message .message_type =message_type # type: ignore
        message .file_url =file_url # type: ignore

        self .session .add (message )
        self .session .commit ()




    def _generate_conversation_title (self ,conversation_id :int ,first_user_message :str )->None :
        generated_title =self .gpt_service .generate_title (first_user_message )

        conversation =self .session .query (ConversationModel ).filter (
        ConversationModel .id ==conversation_id 
        ).first ()

        if conversation :
            conversation .title =generated_title # type: ignore
            self .session .commit ()


    def close (self ):
        self .session .close ()
        self .gpt_service .close ()


    def __enter__ (self ):
        return self 


    def __exit__ (self ,exc_type ,exc ,tb ):
        self .session .close ()
