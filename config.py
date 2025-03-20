import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Ruta a la base de datos
DATABASE_PATH = os.path.join(os.path.dirname(__file__), './static/database/Games.db')
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

# Configuración de SQLAlchemy
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
