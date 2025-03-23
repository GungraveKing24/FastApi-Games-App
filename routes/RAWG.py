from fastapi import APIRouter, Request, Depends
from fastapi.responses import JSONResponse, HTMLResponse
from sqlalchemy.orm import Session 
from config import SessionLocal, API_KEY_RAWG
import requests

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

router = APIRouter()

@router.post("/RAWG/{game_name}", response_class=JSONResponse)
async def RAWG(request: Request, game_name: str):
    url = f"https://api.rawg.io/api/games?key={API_KEY_RAWG}&search={game_name}&page_size=5"

    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        return JSONResponse(content=data, status_code=response.status_code)
    else:
        return JSONResponse(content=response.json(), status_code=response.status_code)
