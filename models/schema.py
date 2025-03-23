from pydantic import BaseModel
import datetime

class Game_Create(BaseModel):
    juego: str
    estado: str
    runN: int
    rejugando: str
    DatosAdicionales: str
    Calificacion: float
    img: str
    fecha_finalizado: datetime