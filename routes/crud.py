from fastapi import Request, APIRouter, HTTPException, Depends, status, requests
from fastapi.responses import JSONResponse
from config import SessionLocal
from models.model import Games
from sqlalchemy.orm import Session
from services.save_files import save_image_url
from datetime import datetime
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
        print("Raw incoming data:", data)  # Debugging
        
        # Validate required fields
        required_fields = ['title', 'status']
        for field in required_fields:
            if field not in data or not data[field]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Field '{field}' is required"
                )

        # Convert dates
        fecha_finalizado = None
        fecha_lanzamiento = None

        try:
            if data.get('fecha_finalizado'):
                fecha_finalizado = datetime.datetime.strptime(data['fecha_finalizado'], '%Y-%m-%d').date()
            if data.get('fecha_lanzamiento'):
                fecha_lanzamiento = datetime.datetime.strptime(data['fecha_lanzamiento'], '%Y-%m-%d').date()
        except (ValueError, TypeError) as e:
            print(f"Error procesando fechas: {e}")

        # Process platforms and genres
        plataformas = data.get('plataformas', [])
        generos = data.get('generos', [])
        
        # Si vienen como string (puede pasar con algunos formularios)
        if isinstance(plataformas, str) and plataformas.startswith('['):
            try:
                plataformas = eval(plataformas)  # Cuidado: eval puede ser peligroso con datos no confiables
            except:
                plataformas = []

        if isinstance(generos, str) and generos.startswith('['):
            try:
                generos = eval(generos)
            except:
                generos = []

        if not plataformas and 'platforms' in data:
            plataformas = data['platforms'] if isinstance(data['platforms'], list) else [data['platforms']]

        if not generos and 'genres' in data:
            generos = data['genres'] if isinstance(data['genres'], list) else [data['genres']]

        # Save images
        cover_url = data.get('cover_url')
        banner_url = data.get('banner_url')
        
        if cover_url:
            cover_filename = await save_image_url(SAVE_LOCATION_COVER, cover_url, f'{uuid.uuid4()}.png')
            cover_url = cover_filename
            
        if banner_url:
            banner_filename = await save_image_url(SAVE_LOCATION_BANNER, banner_url, f'{uuid.uuid4()}.png')
            banner_url = banner_filename

        # Create game object
        new_game = Games(
            juego=data['title'],
            estado=data['status'],
            runN=int(data.get('times_played', 1)),
            rejugando='Sí' if data.get('replaying') else 'No',
            Comentarios=data.get('user_comment'),
            Descripcion=data.get('description'),
            Calificacion=float(data.get('user_rating', 0.0)),
            calificacion_metacritic=float(data.get('metacritic_rating', 0.0)),
            img=cover_url,
            img_heroe=banner_url,
            fecha_finalizado=fecha_finalizado,
            fecha_lanzamiento=fecha_lanzamiento,
            plataformas=json.dumps(plataformas),
            generos=json.dumps(generos),
            horas_jugadas=float(data.get('hours_played', 0.0)),
            HLTB_MAIN=float(data.get('HLTB_MAIN', 0.0)),
            HLTB_MAIN_EXTRA=float(data.get('HLTB_MAIN_EXTRA', 0.0)),
            HLTB_COMPLETIONIST=float(data.get('HLTB_COMPLETIONIST', 0.0))
        )

        print(f"Juego: " + str(new_game.juego) + "\n")
        print(f"Estado: " + str(new_game.estado) + "\n")
        print(f"RunN: " + str(new_game.runN) + "\n")
        print(f"Rejugando: " + str(new_game.rejugando) + "\n")
        print(f"Comentarios: " + str(new_game.Comentarios) + "\n")
        print(f"Descripcion: " + str(new_game.Descripcion) + "\n")
        print(f"Calificacion: " + str(new_game.Calificacion) + "\n")
        print(f"calificacion_metacritic: " + str(new_game.calificacion_metacritic) + "\n")
        print(f"img: " + str(new_game.img) + "\n")
        print(f"img_heroe: " + str(new_game.img_heroe) + "\n")
        print(f"fecha_finalizado: " + str(new_game.fecha_finalizado) + "\n")
        print(f"fecha_lanzamiento: " + str(new_game.fecha_lanzamiento) + "\n")
        print(f"plataformas: " + str(new_game.plataformas) + "\n")
        print(f"generos: " + str(new_game.generos) + "\n")
        print(f"horas_jugadas: " + str(new_game.horas_jugadas) + "\n")        
        print(f"HLTB_MAIN: " + str(new_game.HLTB_MAIN) + "\n")
        print(f"HLTB_MAIN_EXTRA: " + str(new_game.HLTB_MAIN_EXTRA) + "\n")
        print(f"HLTB_COMPLETIONIST: " + str(new_game.HLTB_COMPLETIONIST) + "\n")

        # Save to database
        db.add(new_game)
        db.commit()
        db.refresh(new_game)
        
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={"message": "Juego creado exitosamente", "game_id": new_game.id}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error al crear juego: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al crear el juego. Por favor revise los datos e intente nuevamente."
        )