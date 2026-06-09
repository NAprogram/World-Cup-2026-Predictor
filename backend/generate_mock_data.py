import json
import random
import os

def generate_mock_trajectory(start_x, start_y, end_x, end_y, frames=60):
    # Generates a simple parabolic trajectory between two points
    points = []
    for i in range(frames + 1):
        t = i / frames
        x = start_x + (end_x - start_x) * t
        y = start_y + (end_y - start_y) * t
        # Simple arc for z (height)
        z = 4.0 * t * (1 - t) * 5  # max height 5 meters
        points.append({"x": round(x, 2), "y": round(y, 2), "z": round(z, 2)})
    return points

def generate_mock_match():
    # Pitch dimensions approx 105x68 meters
    events = []
    
    # Event 1: Pass
    events.append({
        "minute": 12,
        "second": 30,
        "type": "pass",
        "player": "Mbappe",
        "team": "France",
        "start_pos": {"x": 50, "y": 30},
        "end_pos": {"x": 75, "y": 20},
        "trajectory": generate_mock_trajectory(50, 30, 75, 20, 30)
    })
    
    # Event 2: Shot & Goal
    events.append({
        "minute": 12,
        "second": 34,
        "type": "goal",
        "player": "Griezmann",
        "team": "France",
        "start_pos": {"x": 75, "y": 20},
        "end_pos": {"x": 105, "y": 34}, # goal center
        "trajectory": generate_mock_trajectory(75, 20, 105, 34, 40)
    })
    
    # Event 3: Yellow Card
    events.append({
        "minute": 42,
        "second": 10,
        "type": "yellow_card",
        "player": "Maguire",
        "team": "England",
        "pos": {"x": 40, "y": 45}
    })

    return {
        "match_id": "FRA_ENG_WC26_QF",
        "home_team": "France",
        "away_team": "England",
        "score": {"home": 2, "away": 1},
        "stats": {
            "possession": {"home": 54, "away": 46},
            "shots": {"home": 14, "away": 9},
            "shots_on_target": {"home": 6, "away": 3},
            "xg": {"home": 1.8, "away": 0.9}
        },
        "events": events
    }

if __name__ == "__main__":
    match_data = generate_mock_match()
    output_path = os.path.join(os.path.dirname(__file__), "mock_tournament_data.json")
    with open(output_path, "w") as f:
        json.dump(match_data, f, indent=4)
    print(f"Mock data generated at {output_path}")
