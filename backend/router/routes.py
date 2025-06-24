from fastapi import APIRouter
from services.R2uploader import R2Uploader

router = APIRouter()
uploader = R2Uploader()

@router.get("/hello")
def say_hello():
    return {"message": "Hello from another route!"}

@router.post("/upload")
def upload_file():
    try:
        response = uploader.upload_file("song.mp3", "song.mp3")
        print("Upload success:", response)
    except Exception as e:
        print("Upload failed:", str(e))