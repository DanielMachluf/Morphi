


import os 
from openai import OpenAI 
from dotenv import load_dotenv 
from models .gpt_model import GptRequest ,GptResponse 
from utils .models_config import TITLE_MODEL 

load_dotenv ()


class GptService :

    def __init__ (self )->None :
        self .client =OpenAI (api_key =os .getenv ("OPENAI_API_KEY"))


    def complete (self ,request :GptRequest )->GptResponse :
        request .validate_model ()

        response =self .client .chat .completions .create (
        model =request .model ,
        messages =[m .model_dump ()for m in request .messages ] # type: ignore
        )

        return GptResponse (
        content =response .choices [0 ].message .content or "",
        token_count =response .usage .total_tokens if response .usage else 0 
        )


    def generate_title (self ,first_user_message :str )->str :
        response =self .client .chat .completions .create (
        model =TITLE_MODEL ,
        messages =[
        {
        "role":"system",
        "content":(
        "You generate short conversation titles. "
        "Return ONLY the title — no quotes, no punctuation, no explanation. "
        "Maximum 5 words."
        )
        },
        {
        "role":"user",
        "content":f"Generate a title for a conversation that started with: {first_user_message }"
        }
        ],
        max_tokens =20 
        )

        return (response .choices [0 ].message .content or "").strip ()

    def close (self ):
        pass 

    def __enter__ (self ):
        return self 

    def __exit__ (self ,exc_type ,exc ,tb ):
        pass 
