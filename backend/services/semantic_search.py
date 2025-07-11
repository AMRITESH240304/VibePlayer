from pymongo import MongoClient
import boto3
from typing import List, Dict, Any
from botocore.client import Config
from config import settings
import certifi
import io
from bson.objectid import ObjectId

class SemanticSearchService:
    def __init__(self):
        # MongoDB setup
        self.client = MongoClient(settings.MONGO_URI, tlsCAFile=certifi.where())
        self.db = self.client["VIBESONG"]
        self.song_embedding = self.db["song_embedding"]
        self.songs = self.db["songs"]
        self.song_embedding_short = self.db["song_embedding_10s"]

        # R2 setup
        self.bucket = "songs"
        self.s3_client = boto3.client(
            "s3",
            endpoint_url=settings.S3_API_URL,
            aws_access_key_id=settings.S3_ACCESS_KEY_ID,
            aws_secret_access_key=settings.S3_SECRET_ACCESS_KEY,
            config=Config(signature_version='s3v4'),
            region_name='us-east-1'
        )
        
    # def _download_song_from_r2(self, file_key: str) -> bytes:
    #     buffer = io.BytesIO()
    #     self.s3_client.download_fileobj(self.bucket, file_key, buffer)
    #     buffer.seek(0)
    #     return buffer.read()
        
    # def _get_embedding_from_audio_bytes(self, audio_bytes: bytes, duration=10) -> List[float]:
    #     with sf.SoundFile(io.BytesIO(audio_bytes)) as snd_file:
    #         sr = snd_file.samplerate
    #         num_frames = int(duration * sr)
    #         audio = snd_file.read(frames=num_frames, dtype="float32")

    #     embedding, _ = openl3.get_audio_embedding(audio, sr, content_type="music", embedding_size=512)
    #     return embedding.mean(axis=0).tolist()

    def _vector_search(self, query_vector: List[float], limit: int) -> List[str]:

        pipeline = [
            {
                "$vectorSearch": {
                    "index": "vector_index",
                    "path": "embedding",
                    "queryVector": query_vector,
                    "numCandidates": 50,
                    "limit": limit
                }
            },
            {
                "$project": {
                    "title": 1,
                    "artist": 1,
                    "file_key": 1,
                    "score": {"$meta": "vectorSearchScore"}
                }
            }
        ]
        results = list(self.song_embedding.aggregate(pipeline))
        return [str(r["_id"]) for r in results]
    
    def find_similar_songs(self, song_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        # Step 1: Find song metadata
        song = self.song_embedding_short.find_one({"_id": song_id})
        if not song:
            raise Exception("Song not found.")
        
        file_key = song["file_key"]

        # Step 2: Download bytes & compute embedding in memory
        # audio_bytes = self._download_song_from_r2(file_key)
        # embedding = self._get_embedding_from_audio_bytes(audio_bytes)
        
        embedding = song.get("embedding_10s")

        # Step 3: Vector search
        similar_ids = self._vector_search(embedding, limit)

        # Step 4: Fetch metadata
        results = list(self.songs.find({"_id": {"$in": [ObjectId(sid) for sid in similar_ids]}}))

        return results

        
    # get embeddings of the song in timeframe
    # query the database for similar songs
    # return top N results with metadata