from pydantic import BaseModel, Field
from typing import List, Optional

class PlaylistSong(BaseModel):
    song_id: str
    added_at: Optional[str]
    order: int

class Playlist(BaseModel):
    id: Optional[str] = Field(alias="_id")
    name: str
    description: Optional[str]
    user_id: str
    songs: List[PlaylistSong]
    created_at: Optional[str]
