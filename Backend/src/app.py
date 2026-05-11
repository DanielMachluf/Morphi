import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from uvicorn import run
from middleware.error_handler import register_exception_handlers
from middleware.logger_middleware import LoggerMiddleware
from controllers import persona_controller, conversation_controller, messages_controller, gpt_controller

# Create the REST API server (similar to express server)
server = FastAPI()

# Register exception handlers:
register_exception_handlers(server)

# Register CORS middleware — allow frontend to make cross-origin requests
server.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register middleware:
server.add_middleware(LoggerMiddleware)

# Serve uploaded chat files so the frontend can render image history.
uploads_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "uploads"))
server.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Register routes:
server.include_router(persona_controller.router)
server.include_router(conversation_controller.router)
server.include_router(messages_controller.router)
server.include_router(gpt_controller.router)

# Run this line only if app.py started directly from the terminal: 
if __name__ == "__main__":
    run("app:server", port = 4000, reload = True) 
    # reload = True --> similar to nodemon - hot reloading
    # log_level = "critical/error/warning/info/debug" --> console noise





# pip install python-dotenv
# pip install mysql-connector-python
# pip install sqlalchemy
# pip install fastapi
# pip install uvicorn

# pip freeze > requirements.txt

