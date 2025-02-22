from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import init_app
from configs import Config

app = FastAPI()

# Replace "*" with the domains that should be allowed to access the API
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Welcome to chat PDFs!"}


init_app(app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app="main:app", host="localhost",
                port=Config.APP_PORT, reload=True)
