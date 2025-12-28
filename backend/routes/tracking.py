from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_tracking():
    return {"status": "Tracking endpoint active"}
