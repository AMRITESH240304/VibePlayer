from pydantic import BaseModel, Field
from typing import Optional

class Song(BaseModel):
    id: Optional[str] = Field(alias="_id")
    title: str
    artist: str
    album: Optional[str]
    duration: int
    cover_image: Optional[str]
    file_key: str
    release_year: Optional[int]
    created_at: Optional[str]
