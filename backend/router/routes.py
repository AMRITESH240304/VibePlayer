from fastapi import APIRouter,Header, Response, UploadFile, File,Form
from services.R2uploader import R2Uploader
from typing import Optional
from services.streamservice import AudioStreamService
from services.mongoservice import MongoService
from models.song_model import Song
import json

router = APIRouter()
uploader = R2Uploader()
stream_service = AudioStreamService(s3_client=uploader.s3_client, bucket=uploader.bucket)
mongo_service = MongoService()

@router.get("/hello")
def say_hello():
    return {"message": "Hello from another route!"}

@router.get("/songs/{song_id}")
def get_song(song_id:str):
    try:
        song = mongo_service.get_song_by_id(song_id)
        if not song:
            return Response(content="Song not found", status_code=404)
        json_song = json.loads(json.dumps(song, default=str))
        return {"message": json_song}
    except Exception as e:
        print("Error fetching song:", str(e))
        return Response(content=f"Error fetching song: {str(e)}", status_code=500)
    
@router.get("/stream/{song_id}")
def stream_audio(song_id: str, range: Optional[str] = Header(None)):
    try:
        song_info = mongo_service.get_song_by_id(song_id)
        print("Streaming song info:", song_info)
        file_key = song_info.get("file_key")
        return stream_service.stream_audio(file_key=file_key, range=range)
    except Exception as e:
        return Response(content=f"Error streaming audio: {str(e)}", status_code=500)
    

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    title: str = Form(...),
    artist: str = Form(...),
    album: Optional[str] = Form(None),
    duration: int = Form(...),
    cover_image: Optional[str] = Form(None),
    release_year: Optional[int] = Form(None)
):
    try:
        response = uploader.upload_file(file.file, file.filename)
        
        if not response:
            return Response(content="Upload failed", status_code=500)

        result = mongo_service.insert_song({
            "title": title,
            "artist": artist,
            "album": album,
            "duration": duration,
            "cover_image": cover_image,
            "file_key": file.filename,
            "release_year": release_year
        })

        if not result:
            return Response(content="Database insertion failed", status_code=500)

        return {"message": "File uploaded successfully", "response": result}

    except Exception as e:
        print("Upload failed:", str(e))
        return Response(content=f"Upload failed: {str(e)}", status_code=500)
