from fastapi import APIRouter,Header, Response, UploadFile, File,Form
from services.R2uploader import R2Uploader
from typing import Optional
from services.streamservice import AudioStreamService
from services.mongoservice import MongoService
from models.song_model import Song
from models.playlist_model import Playlist
import json
from services.semantic_search import SemanticSearchService

router = APIRouter()
uploader = R2Uploader()
stream_service = AudioStreamService(s3_client=uploader.s3_client, bucket=uploader.bucket)
mongo_service = MongoService()

@router.get("/hello")
def say_hello():
    return {"message": "Hello from another route!"}

@router.post("/playlists")
def create_playlist(playlist: Playlist):
    try:
        result = mongo_service.create_playlist(playlist.model_dump(by_alias=True, exclude_none=True))
        return {"message": "Playlist created successfully", "playlist_id": str(result)}
    except Exception as e:
        print("Error creating playlist:", str(e))
        return Response(content=f"Error creating playlist: {str(e)}", status_code=500)

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
    
@router.get("/songs")
def get_all_songs():
    try:
        songs = mongo_service.get_all_songs()
        if not songs:
            return Response(content="No songs found", status_code=404)
        json_songs = [json.loads(json.dumps(song, default=str)) for song in songs]
        return {"message": json_songs}
    except Exception as e:
        print("Error fetching songs:", str(e))
        return Response(content=f"Error fetching songs: {str(e)}", status_code=500)
    
@router.get("/stream/{song_id}")
def stream_audio(song_id: str, range: Optional[str] = Header(None)):
    try:
        song_info = mongo_service.get_song_by_id(song_id)
        print("Streaming song info:", song_info)
        file_key = song_info.get("file_key")
        return stream_service.stream_audio(file_key=file_key, range=range)
    except Exception as e:
        return Response(content=f"Error streaming audio: {str(e)}", status_code=500)

@router.get("/find_similar/{song_id}")
def find_similar_songs(song_id: str, limit: int = 5):
    try:
        search_service = SemanticSearchService()
        similar = search_service.find_similar_songs(song_id, limit)
        return json.loads(json.dumps(similar, default=str))
    except Exception as e:
        return Response(content=f"Error finding similar songs: {str(e)}", status_code=500)

@router.get("/stream/playlist/")
def stream_playlist():
    try:
        playlist = mongo_service.get_all_playlists()
        if not playlist:
            return Response(content="No playlists found", status_code=404)
        playlist_songs = []
        for pl in playlist: 
            song_ids = [song["song_id"] for song in pl.get("songs", [])]
            songs = mongo_service.get_songs_by_ids(song_ids)
            playlist_songs.append({
                "playlist_id": str(pl["_id"]),
                "name": pl.get("name"),
                "songs": [json.loads(json.dumps(song, default=str)) for song in songs]
            })
        return {"message": playlist_songs}
    except Exception as e:
        return Response(content=f"Error streaming playlist: {str(e)}", status_code=500)

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
