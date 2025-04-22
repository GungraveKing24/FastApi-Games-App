from fastapi import APIRouter, Request, Depends
from fastapi.responses import JSONResponse, HTMLResponse
from howlongtobeatpy import HowLongToBeat

router = APIRouter(tags=["HowLongToBeat"])

@router.get("/HLTB/search/{name}")
async def search_hltb(name: str):
    results = await HowLongToBeat().async_search(name)
    if results:
        return {
            "results": [
                {
                    "id": r.game_id,
                    "name": r.game_name,
                    "similarity": r.similarity,
                    "image": r.game_image_url
                }
                for r in results
            ]
        }
    return {"results": []}

@router.get("/HLTB/id/{game_id}")
async def hltb_by_id(game_id: int):
    result = await HowLongToBeat().async_search_from_id(game_id)
    if result:
        return {
            "name": result.game_name,
            "main": result.main_story,
            "main_extra": result.main_extra,
            "completionist": result.completionist
        }
    return JSONResponse(content={"message": "Juego no encontrado"}, status_code=404)
