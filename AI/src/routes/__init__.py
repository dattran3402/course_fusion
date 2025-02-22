from fastapi import FastAPI

from routes import (
    chat_controller,
)

def init_app(app: FastAPI):
    app.include_router(chat_controller.router)
