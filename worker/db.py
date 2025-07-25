from pymongo import MongoClient
from config import settings
import certifi

class Mongo:
    def __init__(self):
        self.client = MongoClient(settings.MONGO_URI, tlsCAFile=certifi.where())
        self.db = self.client["VIBESONG"]
        self.collection = self.db["song_embedding"]
        self.small_collection = self.db["song_embedding_10s"]
        
    def insert_data(self,data) -> str:
        result = self.collection.insert_one(data)
        return str(result.inserted_id)

    def insert_small_data(self, data) -> str:
        result = self.small_collection.insert_one(data)
        return str(result.inserted_id)