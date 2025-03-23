from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

# Ruta a la base de datos
DATABASE_PATH = os.path.join(os.path.dirname(__file__), './static/database/Games.db')
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

#Optener API KEYS
API_KEY_RAWG = os.environ.get('API_KEY_RAWG', None)

# Configuración de SQLAlchemy
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
