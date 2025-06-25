from fastapi import APIRouter,Header, Response
from services.R2uploader import R2Uploader
from typing import Optional
from services.streamservice import AudioStreamService

router = APIRouter()
uploader = R2Uploader()
stream_service = AudioStreamService(s3_client=uploader.s3_client, bucket=uploader.bucket)

@router.get("/hello")
def say_hello():
    return {"message": "Hello from another route!"}

@router.get("/stream/{file_key}")
def stream_audio(file_key: str, range: Optional[str] = Header(None)):
    return stream_service.stream_audio(file_key=file_key, range=range)

@router.post("/upload")
def upload_file():
    try:
        response = uploader.upload_file("song.mp3", "song.mp3")
        print("Upload success:", response)
    except Exception as e:
        print("Upload failed:", str(e))