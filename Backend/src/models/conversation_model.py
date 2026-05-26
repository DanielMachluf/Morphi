

from typing import Optional ,Literal 
from sqlalchemy import Column ,Integer ,String ,text 
from utils .models_config import ALLOWED_MODELS 
from utils .dal import BaseModel 
from pydantic import BaseModel as BaseSchema ,Field 







class ConversationSchema (BaseSchema ):
    id :Optional [int ]=None 
    persona_id :int =Field (ge =1 )
    title :Optional [str ]=Field (default ='New conversation',min_length =1 ,max_length =255 )
    model :Optional [str ]=Field (default ='gpt-4o')
    status :Optional [Literal ['active','archived']]='active'


    def validate_model (self ):
        if self .model not in ALLOWED_MODELS :
            raise ValueError (f"model must be one of: {ALLOWED_MODELS }")



class ConversationModel (BaseModel ):


    __tablename__ ="conversations"


    id =Column (Integer ,primary_key =True )
    persona_id =Column (Integer ,nullable =False )
    title =Column (String (255 ),nullable =False ,default ='New conversation')
    model =Column (String (50 ),nullable =False ,default ='gpt-4o')
    status =Column (String (20 ),nullable =False ,default ='active')
    created_at =Column (String (50 ),server_default =text ("CURRENT_TIMESTAMP"))
    updated_at =Column (String (50 ),server_default =text ("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"))