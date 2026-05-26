


from fastapi import APIRouter 
from pydantic import BaseModel ,Field 
from models .gpt_model import GptRequest 
from services .gpt_service import GptService 

router =APIRouter ()



class GenerateTitleSchema (BaseModel ):
    first_user_message :str =Field (min_length =1 )


@router .post ("/api/gpt/complete")
def complete (request :GptRequest ):
    with GptService ()as service :
        return service .complete (request )


@router .post ("/api/gpt/generate-title")
def generate_title (body :GenerateTitleSchema ):
    with GptService ()as service :
        title =service .generate_title (body .first_user_message )
        return {"title":title }
