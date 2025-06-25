from pymongo import MongoClient
from config import settings
from bson.objectid import ObjectId
from typing import Any, Dict, List, Optional
import certifi

class MongoService:
    def __init__(self):
        self.client = MongoClient(settings.MONGO_URI,tlsCAFile=certifi.where())
        self.db = self.client["VIBESONG"]
        self.songs = self.db["songs"]
        self.playlists = self.db["playlists"]
        
    def insert_song(self, song_data: Dict[str, Any]) -> str:
        result = self.songs.insert_one(song_data)
        return str(result)

    def get_song_by_id(self, song_id: str) -> Optional[Dict[str, Any]]:
        return self.songs.find_one({"_id": ObjectId(song_id)})

    def get_songs_by_ids(self, song_ids: List[str]) -> List[Dict[str, Any]]:
        object_ids = [ObjectId(sid) for sid in song_ids]
        return list(self.songs.find({"_id": {"$in": object_ids}}))

    # # ───────────── PLAYLISTS ─────────────

    # def create_playlist(self, playlist_data: Dict[str, Any]) -> str:
    #     result = self.playlists.insert_one(playlist_data)
    #     return str(result.inserted_id)

    # def get_playlist_by_id(self, playlist_id: str) -> Optional[Dict[str, Any]]:
    #     return self.playlists.find_one({"_id": ObjectId(playlist_id)})

    # def get_playlist_with_songs(self, playlist_id: str) -> Optional[Dict[str, Any]]:
    #     playlist = self.get_playlist_by_id(playlist_id)
    #     if not playlist:
    #         return None
        
    #     # Extract song IDs in order
    #     ordered_songs = sorted(playlist["songs"], key=lambda s: s["order"])
    #     song_ids = [s["song_id"] for s in ordered_songs]

    #     songs = self.get_songs_by_ids(song_ids)
    #     song_map = {str(song["_id"]): song for song in songs}

    #     # Attach song metadata to playlist's song entries
    #     playlist["songs"] = [
    #         {
    #             **s,
    #             "metadata": song_map.get(s["song_id"])
    #         } for s in ordered_songs
    #     ]

    #     return playlist