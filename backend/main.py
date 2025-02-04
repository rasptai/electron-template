import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent)) # backendをルートディレクトリとして自作モジュールがimportできるようにする

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# from core.database import create_db_and_tables
# from routers import router as *router

app = FastAPI()
# create_db_and_tables()
# app.include_router(*router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)