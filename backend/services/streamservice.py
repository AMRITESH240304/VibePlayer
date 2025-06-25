from typing import Optional
from fastapi.responses import StreamingResponse, Response
import mimetypes

class AudioStreamService:
    def __init__(self, s3_client, bucket: str):
        self.s3_client = s3_client
        self.bucket = bucket

    def stream_audio(self, file_key: str, range: Optional[str] = None):
        try:
            # Parse Range header
            if range and range.startswith("bytes="):
                try:
                    start_str, end_str = range.replace("bytes=", "").split("-")
                    start = int(start_str) if start_str else 0
                    end = int(end_str) if end_str else None
                except ValueError:
                    return Response("Invalid Range header", status_code=400)
            else:
                start = 0
                end = None

            # Get metadata
            metadata = self.s3_client.head_object(
                Bucket=self.bucket,
                Key=file_key
            )
            total_size = metadata['ContentLength']

            if start >= total_size:
                return Response("Requested range not satisfiable", status_code=416)

            if end is None or end >= total_size:
                end = total_size - 1

            content_length = end - start + 1
            byte_range = f"bytes={start}-{end}"

            # Get stream from S3
            s3_stream = self.s3_client.get_object(
                Bucket=self.bucket,
                Key=file_key,
                Range=byte_range
            )['Body']

            # Guess MIME type
            mime_type, _ = mimetypes.guess_type(file_key)

            headers = {
                "Content-Range": f"bytes {start}-{end}/{total_size}",
                "Accept-Ranges": "bytes",
                "Content-Length": str(content_length),
                "Content-Type": mime_type or "application/octet-stream",
                "Cache-Control": "public, max-age=3600"
            }

            print(f"Streaming: {file_key}, Range: {byte_range}, Total: {total_size}")
            return StreamingResponse(s3_stream, status_code=206, headers=headers)

        except self.s3_client.exceptions.NoSuchKey:
            return Response("File not found", status_code=404)
        except Exception as e:
            return Response(str(e), status_code=500)
