from sqlalchemy import create_engine
from utils.app_config import AppConfig
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Create once a base-class for each model to inherit:
BaseModel = declarative_base()

class Dal: 

    # Session object performs actions on the database.
    def create_session(self):

        # Create an engine object which handles the connection: 
        engine = create_engine(AppConfig.connection_string)

        # Create all tables if not exist:
        BaseModel.metadata.create_all(engine)

        # Create a session factory (function for creating session objects):
        session_factory = sessionmaker(bind = engine)

        # Create the session which can CRUD the database:
        session = session_factory()

        # Return the session:
        return session
