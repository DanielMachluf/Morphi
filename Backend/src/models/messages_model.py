

from typing import Optional ,Literal 
from sqlalchemy import Column ,Integer ,String ,Text ,text 
from utils .dal import BaseModel 
from pydantic import BaseModel as BaseSchema ,Field 



class MessageSchema (BaseSchema ):
    id :Optional [int ]=None 
    conversation_id :int =Field (ge =1 )
    role :Literal ['user','assistant','system']
    content :str =Field (min_length =1 )
    token_count :Optional [int ]=Field (default =None ,ge =1 )
    message_type :Optional [Literal ['text','voice','pdf','image']]='text'
    file_url :Optional [str ]=None 



class MessageModel (BaseModel ):


    __tablename__ ="messages"


    id =Column (Integer ,primary_key =True )
    conversation_id =Column (Integer ,nullable =False )
    role =Column (String (20 ),nullable =False )
    content =Column (Text ,nullable =False )
    token_count =Column (Integer ,nullable =True )
    message_type =Column (String (20 ),nullable =False ,default ='text')
    file_url =Column (String (500 ),nullable =True )
    created_at =Column (String (50 ),server_default =text ("CURRENT_TIMESTAMP"))
