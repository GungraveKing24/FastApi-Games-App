from sqlalchemy import Column, Integer, String, Float, Date, Text
from config import Base

class Games(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True)
    juego = Column(String(255), nullable=False)
    estado = Column(String(255), nullable=False)
    runN = Column(Integer, nullable=False, default=1)
    rejugando = Column(String(255), nullable=False, default='No')
    Comentarios = Column(Text, nullable=True)
    Descripcion = Column(Text, nullable=True)
    Calificacion = Column(Float, default=0.0)
    calificacion_metacritic = Column(Float, default=0.0)
    img = Column(String(255), default=None) # Imagen principal (carátula)
    img_heroe = Column(String(255), default=None)  # Imagen de portada (hero)
    fecha_finalizado = Column(Date, default=None)
    fecha_lanzamiento = Column(Date, default=None)
    plataformas = Column(Text)  # Almacenará un JSON con las plataformas
    generos = Column(Text)      # Almacenará un JSON con los géneros
    horas_jugadas = Column(Float, default=0.0)
    HLTB_MAIN = Column(Float, default=0.0)
    HLTB_MAIN_EXTRA = Column(Float, default=0.0)
    HLTB_COMPLETIONIST = Column(Float, default=0.0)