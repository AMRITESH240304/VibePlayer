from config import settings
import boto3
from botocore.client import Config
from dataplane import s3_upload
import os

class R2Uploader:
    def __init__(self):

        self.bucket = "songs"
        self.client_access_key = settings.S3_ACCESS_KEY_ID
        self.client_secret = settings.S3_SECRET_ACCESS_KEY
        self.connection_url = settings.S3_API_URL

        self.s3_client = boto3.client(
            's3',
            endpoint_url=self.connection_url,
            aws_access_key_id=self.client_access_key,
            aws_secret_access_key=self.client_secret,
            config=Config(signature_version='s3v4'),
            region_name='us-east-1'
        )
        
    def upload_file(self, local_file_path: str, target_key: str):
        if not os.path.exists(local_file_path):
            raise FileNotFoundError(f"{local_file_path} not found.")

        with open(local_file_path, 'rb') as f:
            file_bytes = f.read()

        result = s3_upload(
            Bucket=self.bucket,
            S3Client=self.s3_client,
            TargetFilePath=target_key,
            UploadObject=file_bytes,
            UploadMethod="Object"
        )

        return result