import os 
from fastapi import FastAPI 
from fastapi .middleware .cors import CORSMiddleware 
from fastapi .staticfiles import StaticFiles 
from uvicorn import run 
from middleware .error_handler import register_exception_handlers 
from middleware .logger_middleware import LoggerMiddleware 
from controllers import persona_controller ,conversation_controller ,messages_controller ,gpt_controller 


server =FastAPI ()


register_exception_handlers (server )


server .add_middleware (
CORSMiddleware ,
allow_origins =["http://localhost:5173","http://localhost:4000","http://127.0.0.1:5173","http://127.0.0.1:3000"],
allow_credentials =True ,
allow_methods =["*"],
allow_headers =["*"],
)


server .add_middleware (LoggerMiddleware )


uploads_dir =os .path .abspath (os .path .join (os .path .dirname (__file__ ),"..","uploads"))
server .mount ("/uploads",StaticFiles (directory =uploads_dir ),name ="uploads")


server .include_router (persona_controller .router )
server .include_router (conversation_controller .router )
server .include_router (messages_controller .router )
server .include_router (gpt_controller .router )


if __name__ =="__main__":
    run ("app:server",port =4000 ,reload =True )















