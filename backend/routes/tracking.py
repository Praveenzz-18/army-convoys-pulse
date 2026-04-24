import json
from datetime import datetime
from typing import Dict, List
from database.firebase_db import convoy_db
from middleware.auth import get_user_id
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                # Connection might be dead
                pass

manager = ConnectionManager()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # We mostly just push data to clients, 
            # but we need to keep the connection alive
            data = await websocket.receive_text()
            # If clients send data, we can broadcast it too
            await manager.broadcast(data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@router.post("/update")
async def update_location(update: Dict, user_id: str = Depends(get_user_id)):
    """
    Expects: {"convoy_id": "...", "lat": ..., "lng": ..., "status": "..."}
    """
    convoy_id = update.get("convoy_id")
    if not convoy_id:
        raise HTTPException(400, "Missing convoy_id")
        
    # Verify ownership
    existing = convoy_db.get(convoy_id)
    if not existing or existing.get('user_id') != user_id:
        raise HTTPException(403, "Not authorized to update tracking for this convoy")
        
    # Broadcast to all connected map clients
    payload = {
        **update,
        "timestamp": datetime.utcnow().isoformat()
    }
    await manager.broadcast(json.dumps(payload))
    return {"status": "success", "broadcasted": True}
