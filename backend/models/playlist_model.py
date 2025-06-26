from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List

class PlaylistSong(BaseModel):
    song_id: str
    added_at: Optional[str] = None
    order: int

class Playlist(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra='ignore')

    id: Optional[str] = Field(default=None, alias="_id")
    name: str
    description: Optional[str] = None
    songs: List[PlaylistSong]
    created_at: Optional[str] = None
