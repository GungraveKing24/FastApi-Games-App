from fastapi import FastAPI, Request, Depends
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from models.model import Games
from flaskwebgui import FlaskUI
from config import SessionLocal
from routes.RAWG import router
import uvicorn

app = FastAPI()

# Servir archivos estáticos desde /static/
app.mount("/static", StaticFiles(directory="static"), name="static")

# Cargar plantillas desde /templates/
templates = Jinja2Templates(directory="templates")

# Dependencia para la sesión de la base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/", response_class=HTMLResponse)
async def root(request: Request, db: Session = Depends(get_db)):
    games_added = db.query(Games).order_by(Games.id.desc()).limit(4).all()
    games = db.query(Games).filter(Games.estado == "Jugando").order_by(Games.estado.desc()).limit(4).all()
    return templates.TemplateResponse("index.html", {"request": request, "games": games, "games_added": games_added})

@app.get("/games", response_class=HTMLResponse)
async def games(request: Request, db: Session = Depends(get_db), q: str = ""):
    games = db.query(Games).filter(Games.juego.ilike(f"%{q}%")).all() if q else db.query(Games).all()
    estados = [estado[0] for estado in db.query(Games.estado).distinct().all()]
    return templates.TemplateResponse("games.html", {"request": request, "games": games, "estados": estados})

@app.get("/search", response_class=JSONResponse)
async def search(q: str = "", db: Session = Depends(get_db)):
    if not q:
        return JSONResponse(content=[], status_code=200)
    
    games = db.query(Games).filter(Games.juego.ilike(f"%{q}%")).all()
    return JSONResponse(content=[{"id": game.id, "juego": game.juego} for game in games])

@app.get("/search/results/{juego}", response_class=HTMLResponse)
async def search_results_by_game(request: Request, juego: str, db: Session = Depends(get_db)):
    games = db.query(Games).filter(Games.juego.ilike(f"%{juego}%")).all()
    estados = [estado[0] for estado in db.query(Games.estado).distinct().all()]
    
    return templates.TemplateResponse("games.html", {"request": request, "games": games, "estados": estados})

@app.get("/game_details/{id}", response_class=HTMLResponse, name="game_details")
async def game_details(request: Request, id: int, db: Session = Depends(get_db)):
    game = db.query(Games).filter(Games.id == id).first()
    return templates.TemplateResponse("game-details.html", {"request": request, "game": game})

@app.get("/Create", response_class=HTMLResponse)
async def create_game(request: Request, db: Session = Depends(get_db)):
    estados = [estado[0] for estado in db.query(Games.estado).distinct().all()]

    return templates.TemplateResponse("create.html", {"request": request, "estados": estados})

app.include_router(router)

if __name__ == "__main__":
    #FlaskUI(app=app, server="fastapi").run()
    uvicorn.run(app, host="0.0.0.0", port=8000)