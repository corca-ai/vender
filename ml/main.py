from typing import Optional
from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware
import torch

from semservice import semantic_process_video, simscore

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/process")
def process_video_into_semvectors(videoId: str, modelname: Optional[str] = None):
    succ = semantic_process_video(videoId)
    if succ:
        return {"Hello": "World"}


@app.get("/textsim")
def text_similarity(videoId: str, textquery: str):
    score = simscore(videoId, textquery)
    print(score)
    return score
