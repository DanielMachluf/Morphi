from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

# Logger middleware
class LoggerMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request: Request, call_next: Callable) -> Response:

        # Log method: 
        print("Method: " + request.method)

        # Log route: 
        print("Route: " + request.url.path)

        # Log body if exist:
        # body = await request.body()
        # if body:
        #     print("Body:")
        #     print(body.decode())
        try:
            body = await request.json()
            print("Body:", body)
        except: pass

        # Continue to next middleware:
        response = await call_next(request)

        # Return the response: 
        return response
