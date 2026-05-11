# models_config.py
# Single source of truth for all supported OpenAI models.
# When OpenAI releases a new model — you add one line here.
# Everything else in the project updates automatically.

ALLOWED_MODELS = [
    "gpt-4o",
    "gpt-4o-mini", 
    "gpt-3.5-turbo"
]

DEFAULT_MODEL = "gpt-4o"

TITLE_MODEL = "gpt-4o-mini"   # cheap model used only for title generation