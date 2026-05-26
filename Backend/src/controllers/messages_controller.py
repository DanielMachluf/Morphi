


import json 
from fastapi import APIRouter ,File ,Form ,HTTPException ,UploadFile ,status 
from fastapi .responses import StreamingResponse 
from pydantic import BaseModel ,Field 
from services .messages_service import MessagesService 

router =APIRouter ()



class SendMessageSchema (BaseModel ):
    content :str =Field (min_length =1 )


@router .get ("/api/conversations/{id}/messages")
def get_messages_by_conversation (id :int ):
    with MessagesService ()as service :
        return service .get_messages_by_conversation (id )


@router .post ("/api/conversations/{id}/messages",status_code =status .HTTP_201_CREATED )
def send_message (id :int ,body :SendMessageSchema ):
    with MessagesService ()as service :
        ai_response =service .send_message (id ,body .content )
        return {"response":ai_response }


@router .post ("/api/conversations/{conversation_id}/messages/stream")
def send_message_stream (conversation_id :int ,body :SendMessageSchema ):
    def event_generator ():
        with MessagesService ()as service :
            for chunk in service .send_message_stream (conversation_id ,body .content ):
                yield f"data: {json .dumps (chunk )}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse (
    event_generator (),
    media_type ="text/event-stream",
    headers ={
    "Cache-Control":"no-cache",
    "X-Accel-Buffering":"no"
    }
    )


@router .post ("/api/conversations/{conversation_id}/messages/file",status_code =status .HTTP_201_CREATED )
def send_file_message (conversation_id :int ,
file :UploadFile =File (...),
file_type :str =Form (...),
user_text :str =Form (default ="Please analyze this.")):
    if file_type not in ["voice","pdf","image"]:
        raise HTTPException (status_code =422 ,detail ="file_type must be voice, pdf, or image")

    with MessagesService ()as service :
        result =service .send_file_message (
        conversation_id =conversation_id ,
        file =file .file ,
        filename =file .filename , # type: ignore
        file_type =file_type ,
        user_text =user_text 
        )
        return {"response":result }
