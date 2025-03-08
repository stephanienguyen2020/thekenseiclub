from fastapi import APIRouter
router = APIRouter(tags=["conversation"])
        
@router.get("/test")
async def test():
    print("Hello meow")
    return {"message": "Hello meow"}