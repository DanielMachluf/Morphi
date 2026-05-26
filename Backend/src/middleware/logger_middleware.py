from typing import Callable 
from fastapi import Request ,Response 
from starlette .middleware .base import BaseHTTPMiddleware 


class LoggerMiddleware (BaseHTTPMiddleware ):

    async def dispatch (self ,request :Request ,call_next :Callable )->Response :


        print ("Method: "+request .method )


        print ("Route: "+request .url .path )






        try :
            body =await request .json ()
            print ("Body:",body )
        except :pass 


        response =await call_next (request )


        return response 
