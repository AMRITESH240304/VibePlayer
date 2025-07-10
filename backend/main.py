from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from router.routes import router

origins = ["*"]  
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
@app.head("/")
def head_root():
    return None  # HEAD requests return no body

@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI application!"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000)