import redis
import json
import time
from db import Mongo
from process import R2Downloader
from config import settings

embedding_downloader = R2Downloader()
mongo_service = Mongo()
redis_client = redis.Redis.from_url(settings.REDIS_URL)

def process_task(task_data):
    print(f"[Worker] Processing: {task_data}")
    file_key = task_data.get("file_key")
    if not file_key:
        print("[Worker] No file_key found in task data.")
        return
    try:
        file_path = embedding_downloader.download_song(file_key)
        print(f"[Worker] Downloaded song to: {file_path}")

        embedding = embedding_downloader.get_embedding(file_path)
        print(f"[Worker] Embedding for {task_data['file_key']}: {embedding}")
        
        small_embedding = embedding_downloader.get_small_embedding(file_path, duration=10.0)

        task_data = {
            "_id": task_data.get("id"),
            "file_key": task_data.get("file_key"),
            "embedding": embedding,
            "title": task_data.get("title"),
            "artist": task_data.get("artist")
        }
        
        task_data_small = {
            "_id": task_data.get("id"),
            "file_key": task_data.get("file_key"),
            "embedding": small_embedding,
            "title": task_data.get("title"),
            "artist": task_data.get("artist")
        }

        inserted_id = mongo_service.insert_data(task_data)
        inserted_small_id = mongo_service.insert_small_data(task_data_small)
        print(f"[Worker] Inserted data with ID: {inserted_id, inserted_small_id}")
    except Exception as e:
        print(f"[Worker] Error processing task {task_data['file_key']}: {e}")
    finally:
        try:
            import os
            os.remove(file_path)
            print(f"[Worker] Removed temporary file: {file_path}")
        except Exception as cleanup_error:
            print(f"[Worker] Error cleaning up file {file_path}: {cleanup_error}")
    print(f"[Worker] Done with: {task_data['file_key']}")


def main():
    print("[Worker] Started and waiting for tasks...")
    while True:
        try:
            hello, item = redis_client.brpop("songs_queue")
            print(hello)
            print(f"[Worker] Received task: {item}")
            task_data = json.loads(item)
            process_task(task_data)
        except json.JSONDecodeError:
            print("[Worker] Failed to decode task. Skipping...")
        except Exception as e:
            print(f"[Worker] Error: {e}")
            time.sleep(1)  

if __name__ == "__main__":
    main()
