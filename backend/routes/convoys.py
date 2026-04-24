from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from database.firebase_db import convoy_db
from datetime import datetime
from middleware.auth import get_user_id

router = APIRouter()

class ConvoyCreate(BaseModel):
    name: str
    origin: str
    destination: str
    priority: str  # low/medium/high/urgent
    start_time: str  # "2025-12-28T10:00:00Z"
    id: Optional[str] = None # Optional custom ID
    
    # Extended fields from UI
    status: Optional[str] = "pending"
    vehicle_count: Optional[int] = 0
    personnel_count: Optional[int] = 0
    commander: Optional[str] = None
    unit: Optional[str] = None
    cargo: Optional[str] = None
    notes: Optional[str] = None
    checkpoints: Optional[list] = []

    # Backward compatibility (optional)
    vehicles: Optional[list] = []
    cargo_load: Optional[float] = 0.0

class ConvoyResponse(BaseModel):
    id: str
    name: str
    origin: str
    destination: str
    priority: str
    start_time: str
    status: str
    
    # Extended fields
    vehicle_count: Optional[int] = 0
    personnel_count: Optional[int] = 0
    commander: Optional[str] = None
    unit: Optional[str] = None
    cargo: Optional[str] = None
    notes: Optional[str] = None
    checkpoints: Optional[list] = []
    
    vehicles: Optional[list] = []
    cargo_load: Optional[float] = 0.0


@router.post("/", response_model=ConvoyResponse)
def create_convoy(convoy: ConvoyCreate, user_id: str = Depends(get_user_id)):
    data = convoy.model_dump()
    data['user_id'] = user_id
    convoy_id = convoy_db.create(data)
    convoy_data = convoy_db.get(convoy_id)
    convoy_data['id'] = convoy_id
    return ConvoyResponse(**convoy_data)



@router.get("/", response_model=List[ConvoyResponse])
def get_convoys(status: Optional[str] = None, origin: Optional[str] = None, user_id: str = Depends(get_user_id)):
    all_convoys = convoy_db.get_all(user_id=user_id)
    filtered = []
    for c in all_convoys:
        if status and c.get('status') != status:
            continue
        if origin and c.get('origin') != origin:
            continue
        filtered.append(c)
    return filtered

@router.get("/{convoy_id}", response_model=ConvoyResponse)
def get_convoy(convoy_id: str):
    data = convoy_db.get(convoy_id)
    if not data:
        raise HTTPException(404, "Convoy not found")
    data['id'] = convoy_id
    return ConvoyResponse(**data)

@router.put("/{convoy_id}")
def update_convoy(convoy_id: str, update_data: dict, user_id: str = Depends(get_user_id)):
    # Verify ownership before update
    existing = convoy_db.get(convoy_id)
    if not existing or existing.get('user_id') != user_id:
        raise HTTPException(403, "Not authorized to update this convoy")
    
    convoy_db.update(convoy_id, update_data)
    return {"message": "Updated"}

@router.delete("/{convoy_id}")
def delete_convoy(convoy_id: str, user_id: str = Depends(get_user_id)):
    # Verify ownership before delete
    existing = convoy_db.get(convoy_id)
    if not existing or existing.get('user_id') != user_id:
        raise HTTPException(403, "Not authorized to delete this convoy")
        
    convoy_db.delete(convoy_id)
    return {"message": "Deleted"}
   