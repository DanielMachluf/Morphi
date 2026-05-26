from sqlalchemy import create_engine 
from utils .app_config import AppConfig 
from sqlalchemy .ext .declarative import declarative_base 
from sqlalchemy .orm import sessionmaker 


BaseModel =declarative_base ()

class Dal :


    def create_session (self ):


        engine =create_engine (AppConfig .connection_string )


        BaseModel .metadata .create_all (engine )


        session_factory =sessionmaker (bind =engine )


        session =session_factory ()


        return session 
