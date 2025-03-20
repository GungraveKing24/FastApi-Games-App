from sqlalchemy import Column, Integer, String, Float, Date
from config import Base

class Games(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True)
    juego = Column(String(255), nullable=False)
    estado = Column(String(255), nullable=False)
    runN = Column(Integer, nullable=False)
    rejugando = Column(String(255), nullable=False)
    DatosAdicionales = Column(String(255), nullable=False)
    Calificacion = Column(Float, nullable=False)
    img = Column(String(255), nullable=True)
    fecha_finalizado = Column(Date, nullable=True)
