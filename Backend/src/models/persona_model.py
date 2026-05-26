

from typing import Optional 
from sqlalchemy import Column ,Integer ,String ,Text ,Boolean ,text 
from utils .dal import BaseModel 
from pydantic import BaseModel as BaseSchema ,Field 



class PersonaSchema (BaseSchema ):
    id :Optional [int ]=None 
    name :str =Field (min_length =2 ,max_length =100 )
    system_prompt :str =Field (min_length =10 )
    is_default :Optional [bool ]=False 



class PersonaModel (BaseModel ):


    __tablename__ ="personas"


    id =Column (Integer ,primary_key =True )
    name =Column (String (100 ),nullable =False ,unique =True )
    system_prompt =Column (Text ,nullable =False )
    is_default =Column (Boolean ,nullable =False ,default =False )
    created_at =Column (String (50 ),server_default =text ("CURRENT_TIMESTAMP"))