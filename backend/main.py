from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import os

app = FastAPI(title="WC 2026 Predictor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "World Cup 2026 Predictor API is running!"}

@app.get("/api/simulate")
def simulate_tournament():
    # Placeholder for the actual simulation logic
    # In the future, this will call simulator.py to run the ML models
    # For now, we will return some mocked match data for the frontend to visualize
    
    mock_data_path = os.path.join(os.path.dirname(__file__), "mock_tournament_data.json")
    if os.path.exists(mock_data_path):
        with open(mock_data_path, "r") as f:
            return json.load(f)
    
    return {"error": "Mock data not generated yet."}
