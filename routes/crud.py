from fastapi import Request, APIRouter, HTTPException, Depends, status, requests
from fastapi.responses import JSONResponse
from config import SessionLocal
from models.model import Games
from sqlalchemy.orm import Session
from services.save_files import save_image_url
import json, datetime, uuid, os

SAVE_LOCATION_COVER = os.path.join(os.path.dirname(__file__), '../static/images/Caratulas')
SAVE_LOCATION_BANNER = os.path.join(os.path.dirname(__file__), '../static/images/Heroes')

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

router = APIRouter(
    tags=["CRUD"],
    responses={404: {"description": "Not found"}},
)

@router.post("/games/create")
async def create_game(request: Request, db: Session = Depends(get_db)):
    try:
        data = await request.json()
        
        # Convertir fechas de string a date
        fecha_finalizado = datetime.strptime(data.get('fecha_finalizado'), '%Y-%m-%d').date() if data.get('fecha_finalizado') else None
        fecha_lanzamiento = datetime.strptime(data.get('fecha_lanzamiento'), '%Y-%m-%d').date() if data.get('fecha_lanzamiento') else None
        
        # Convertir plataformas y géneros de JSON string a list
        plataformas = json.loads(data.get('plataformas', '[]')) if isinstance(data.get('plataformas'), str) else data.get('plataformas', [])
        generos = json.loads(data.get('generos', '[]')) if isinstance(data.get('generos'), str) else data.get('generos', [])
        
        # Guardar imagenes URL
        if data.get('cover_url'):
            cover_filename = await save_image_url(SAVE_LOCATION_COVER,data['cover_url'], f'{uuid.uuid4()}.png')
            data['cover_url'] = cover_filename
        if data.get('banner_url'):
            banner_filename = await save_image_url(SAVE_LOCATION_BANNER, data['banner_url'], f'{uuid.uuid4()}.png')
            data['banner_url'] = banner_filename

        new_game = Games(
            juego=data.get('title') or data.get('juego'),  # Compatibilidad con ambos nombres
            estado=data.get('status') or data.get('estado'),
            runN=int(data.get('times_played') or data.get('runN', 1)),
            rejugando='Sí' if data.get('replaying') or data.get('rejugando') == 'Sí' else 'No',
            Comentarios=data.get('user_comment') or data.get('Comentarios'),
            Descripcion=data.get('description') or data.get('Descripcion'),
            Calificacion=float(data.get('user_rating') or data.get('Calificacion', 0.0)),
            calificacion_metacritic=float(data.get('metacritic_rating') or data.get('calificacion_metacritic', 0.0)),
            img=data.get('cover_url') or data.get('img'),
            img_heroe=data.get('banner_url') or data.get('img_heroe'),
            fecha_finalizado=fecha_finalizado,
            fecha_lanzamiento=fecha_lanzamiento,
            plataformas=json.dumps(plataformas),
            generos=json.dumps(generos),
            horas_jugadas=float(data.get('hours_played') or data.get('horas_jugadas', 0.0)),
            HLTB_MAIN=float(data.get('HLTB_MAIN', 0.0)),
            HLTB_MAIN_EXTRA=float(data.get('HLTB_MAIN_EXTRA', 0.0)),
            HLTB_COMPLETIONIST=float(data.get('HLTB_COMPLETIONIST', 0.0))
        )
        
        db.add(new_game)
        db.commit()
        db.refresh(new_game)
        
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={"message": "Juego creado exitosamente", "game_id": new_game.id}
        )
        
    except Exception as e:
        db.rollback()
        # Log del error completo para diagnóstico
        print(f"Error al crear juego: {str(e)}")
        print(f"Datos recibidos: {data}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear el juego: {str(e)}"
        )