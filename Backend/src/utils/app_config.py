from dotenv import load_dotenv
from os import getenv

load_dotenv()

class AppConfig: 

    connection_string: str = str(getenv("CONNECTION_STRING"))
    openai_api_key: str = str(getenv("OPENAI_API_KEY"))

