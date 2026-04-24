from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import auth

security = HTTPBearer()

async def get_current_user(res: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verifies the Firebase ID token and returns the user information.
    """
    token = res.credentials
    try:
        # Verify the token with Firebase
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        print(f"❌ Auth Error: {e}")
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Optional: Get only the user ID
async def get_user_id(user: dict = Depends(get_current_user)):
    return user.get("uid")
