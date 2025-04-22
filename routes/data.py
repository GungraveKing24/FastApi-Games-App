from fastapi import APIRouter, Request, Depends
from fastapi.responses import JSONResponse, HTMLResponse
from sqlalchemy.orm import Session 
from config import API_KEY_RAWG, API_KEY_STEAMGRIDDB
import requests, time

router = APIRouter(tags=["RAWG"])

@router.post("/RAWG/{game_name}", response_class=JSONResponse)
async def RAWG(request: Request, game_name: str):
    start_time = time.time()

    url = f"https://api.rawg.io/api/games?key={API_KEY_RAWG}&search={game_name}&page_size=5"

    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        
        # Obtener detalles completos para cada juego
        games_with_details = []
        for game in data.get('results', []):
            detail_url = f"https://api.rawg.io/api/games/{game['id']}?key={API_KEY_RAWG}"
            detail_response = requests.get(detail_url)
            
            if detail_response.status_code == 200:
                detail_data = detail_response.json()
                game['description_raw'] = detail_data.get('description_raw', '')
                games_with_details.append(game)
        
        end_time = time.time()  # Tiempo final
        elapsed_time = round(end_time - start_time, 2)  # Tiempo en segundos, redondeado

        return JSONResponse(content={
            'results': games_with_details,
            'elapsed_time': f"{elapsed_time} segundos"
        }, status_code=200)
    else:
        return JSONResponse(content=response.json(), status_code=response.status_code)
    
@router.get("/steamgriddb/{game_name}", response_class=JSONResponse)
async def steamgriddb(game_name: str):
    search_url = f"https://www.steamgriddb.com/api/v2/search/autocomplete/{game_name}"
    
    headers = {
        "Authorization": f"Bearer {API_KEY_STEAMGRIDDB}"
    }
    
    search_response = requests.get(search_url, headers=headers)
    
    if search_response.status_code == 200:
        search_data = search_response.json()
        
        if search_data.get('success') and search_data.get('data'):
            all_games = search_data['data'][:1]  # ✅ limitar a 5 resultados
            all_images = []

            for game in all_games:
                game_id = game['id']
                
                # Obtener covers
                cover_url = f"https://www.steamgriddb.com/api/v2/grids/game/{game_id}?dimensions=600x900"
                cover_response = requests.get(cover_url, headers=headers)
                covers = cover_response.json().get('data', [])[:10] if cover_response.status_code == 200 else []  # ✅ solo 3
                for c in covers:
                    c["style"] = "cover"
                    all_images.append(c)

                # Obtener heroes
                hero_url = f"https://www.steamgriddb.com/api/v2/heroes/game/{game_id}"
                hero_response = requests.get(hero_url, headers=headers)
                heroes = hero_response.json().get('data', [])[:3] if hero_response.status_code == 200 else []  # ✅ solo 2
                for h in heroes:
                    h["style"] = "hero"
                    all_images.append(h)

            return JSONResponse(content={
                'success': True,
                'data': all_images
            })

    return JSONResponse(content={'success': False, 'data': []}, status_code=200)
