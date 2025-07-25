# get the file from R2 storage
# then convert it to an embedding

import boto3
from botocore.client import Config
from config import settings
import tempfile
import openl3
import soundfile as sf
from pymongo import MongoClient
import certifi
import librosa

class R2Downloader:
    def __init__(self):

        self.bucket = "songs"
        self.client_access_key = settings.S3_ACCESS_KEY_ID
        self.client_secret = settings.S3_SECRET_ACCESS_KEY
        self.connection_url = settings.S3_API_URL
        
        self.client = MongoClient(settings.MONGO_URI, tlsCAFile=certifi.where())
        self.db = self.client["VIBESONG"]
        self.collection = self.db["song_embedding"]

        self.s3_client = boto3.client(
            's3',
            endpoint_url=self.connection_url,
            aws_access_key_id=self.client_access_key,
            aws_secret_access_key=self.client_secret,
            config=Config(signature_version='s3v4'),
            region_name='us-east-1'
        )
    def download_song(self, file_key: str):
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp_file:
            self.s3_client.download_fileobj(self.bucket, file_key, tmp_file)
            return tmp_file.name
        
    def get_embedding(self, file_path: str):
        audio, sr = sf.read(file_path)
        embedding, _ = openl3.get_audio_embedding(audio, sr, content_type="music", embedding_size=512)
        return embedding.mean(axis=0).tolist()

    def get_small_embedding(self, file_path: str, duration: float = 10.0):
        audio, sr = sf.read(file_path)
        embedding, _ = openl3.get_audio_embedding(audio, sr, content_type="music", embedding_size=512, duration=duration)
        return embedding.mean(axis=0).tolist()

