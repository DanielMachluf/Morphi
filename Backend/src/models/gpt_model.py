




import os 
from typing import Literal ,List 
from openai import OpenAI 
from pydantic import BaseModel as BaseSchema ,Field 
from utils .models_config import ALLOWED_MODELS ,DEFAULT_MODEL ,TITLE_MODEL 


client =OpenAI (api_key =os .getenv ("OPENAI_API_KEY")or "missing-openai-api-key")




class GptMessage (BaseSchema ):
    role :Literal ["system","user","assistant"]
    content :str =Field (min_length =1 )




class GptRequest (BaseSchema ):
    model :str =Field (default =DEFAULT_MODEL )
    messages :List [GptMessage ]


    def validate_model (self ):
        if self .model not in ALLOWED_MODELS :
            raise ValueError (f"model must be one of: {ALLOWED_MODELS }")




class GptResponse (BaseSchema ):
    content :str 
    token_count :int 
