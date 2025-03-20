from fastapi import FastAPI, Request, Depends
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from models.model import Games
from flaskwebgui import FlaskUI
from config import SessionLocal
import uvicorn

app = FastAPI()

# Servir archivos estáticos desde /static/
app.mount("/static", StaticFiles(directory="static"), name="static")

# Cargar plantillas desde /templates/
templates = Jinja2Templates(directory="templates")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/", response_class=HTMLResponse)
async def root(request: Request, db: Session = Depends(get_db)):
    games = db.query(Games).all()
    return templates.TemplateResponse("index.html", {"request": request, "games": games})


@app.get("/home", response_class=HTMLResponse)
async def home(request: Request, db: Session = Depends(get_db)):
    games = db.query(Games).all()
    
    estados = [estado[0] for estado in db.query(Games.estado).distinct().all()]
    return templates.TemplateResponse("games.html", {"request": request, "games": games, "estados": estados})


if __name__ == "__main__":
    #uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
    FlaskUI(app=app, server="fastapi").run()
