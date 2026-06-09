import os
import json
import numpy as np
import uuid
import random
import math

GROUPS = {
    "A": ["Mexico", "South Africa", "Korea Republic", "Czechia"],
    "B": ["Canada", "Switzerland", "Qatar", "Bosnia and Herzegovina"],
    "C": ["Brazil", "Morocco", "Haiti", "Scotland"],
    "D": ["United States", "Paraguay", "Australia", "Türkiye"],
    "E": ["Germany", "Curaçao", "Côte d'Ivoire", "Ecuador"],
    "F": ["Netherlands", "Japan", "Tunisia", "Sweden"],
    "G": ["Belgium", "Egypt", "Iran", "New Zealand"],
    "H": ["Spain", "Cabo Verde", "Saudi Arabia", "Uruguay"],
    "I": ["France", "Senegal", "Norway", "Iraq"],
    "J": ["Argentina", "Algeria", "Austria", "Jordan"],
    "K": ["Portugal", "Uzbekistan", "Colombia", "Congo DR"],
    "L": ["England", "Croatia", "Ghana", "Panama"],
}

# PHASE 9/10: WIDENED ELO RATINGS (Scale: 1200 - 2800)
BASE_ELO_RATINGS = {
    # TIER 1: The Elite Giants
    "Argentina": 2800, "Spain": 2780, "France": 2750, "England": 2720,
    # TIER 2: Heavyweights
    "Portugal": 2600, "Netherlands": 2580, "Germany": 2550, "Uruguay": 2520,
    # TIER 3: Strong Competitors
    "Brazil": 2400, "Croatia": 2380, "Belgium": 2350, "Morocco": 2300, "Switzerland": 2250,
    # TIER 4: Solid Mid-Tier (Colombia downgraded per user request)
    "Colombia": 2100, "United States": 2100, "Mexico": 2080, "Senegal": 2050, "Japan": 2020, 
    "Iran": 2000, "Korea Republic": 1980, "Ecuador": 1950, "Türkiye": 1920, "Sweden": 1900, "Austria": 1880, "Czechia": 1850,
    # TIER 5: Lower Mid-Tier
    "Norway": 1800, "Australia": 1780, "Scotland": 1750, "Paraguay": 1720, "Tunisia": 1700,
    "Algeria": 1680, "Côte d'Ivoire": 1650, "Canada": 1620, "Egypt": 1600,
    # TIER 6: Weak
    "Saudi Arabia": 1500, "South Africa": 1480, "Qatar": 1450, "Bosnia and Herzegovina": 1420, 
    "Panama": 1400, "Cabo Verde": 1380, 
    # TIER 7: Minnows
    "Uzbekistan": 1300, "Iraq": 1280, "Jordan": 1250, "New Zealand": 1220, "Congo DR": 1200, 
    "Haiti": 1150, "Curaçao": 1100
}

# PHASE 9/10: RECENT FORM ENGINE
# Weights: WC 2022 (20%), Euro/Copa 2024 (50%), Friendlies/Qualifiers Last 2 Years (30%)
RECENT_FORM_MULTIPLIERS = {
    "Argentina": 1.25,   # WC 2022 Winners + Copa 2024 Winners
    "Spain": 1.25,       # Euro 2024 Winners
    "England": 1.10,     # Euro 2024 Finalists
    "France": 1.10,      # WC 2022 Finalists, Euro Semi
    "Uruguay": 1.08,     # Copa 2024 Semi
    "Germany": 1.05,     # Improving under Nagelsmann
    "Colombia": 1.00,    # Downgraded to neutral per user request
    "Brazil": 0.85,      # Historically poor qualifiers
    "Belgium": 0.90,     # Aging squad
    "Mexico": 0.95,      # Struggling form
    "United States": 0.95, # Poor Copa 2024
}

# PHASE 10: PUBLIC HYPE & BETTING ODDS MULTIPLIER
# Represents the massive public backing and historical "clutch" factor of absolute favorites.
PUBLIC_HYPE_MULTIPLIERS = {
    "France": 1.15,      # Massive public backing, deep squad
    "Brazil": 1.15,      # Even in poor form, the global hype/belief is always massive
    "England": 1.10,     # "It's coming home" media hype
    "Argentina": 1.10,   # Messi hype, defending champs
    "Spain": 1.05,       # High respect
    "Germany": 1.05,     # Historical tournament giants
    "Portugal": 1.05,    # Ronaldo hype
}

TACTICAL_STYLES = {
    "Argentina": [0.75, 0.15, 0.10], "England": [0.70, 0.10, 0.20], "France": [0.80, 0.10, 0.10],
    "Brazil": [0.85, 0.05, 0.10], "Germany": [0.75, 0.10, 0.15], "Portugal": [0.70, 0.15, 0.15],
    "Croatia": [0.65, 0.15, 0.20], "Morocco": [0.75, 0.05, 0.20],
}
DEFAULT_STYLE = [0.75, 0.10, 0.15]

GLOBAL_STATS = {}

def init_player(name, team, position, age):
    if name not in GLOBAL_STATS:
        GLOBAL_STATS[name] = {
            "name": name, "team": team, "position": position, "age": age,
            "goals": 0, "assists": 0, "dribbles": 0, "saves": 0, 
            "yellow_cards": 0, "red_cards": 0, "clean_sheets": 0, "points": 0
        }

def load_rosters():
    # Strict list of players who are actually under 23
    KNOWN_YOUNG_STARS = {
        "Lamine Yamal": 18, "Jude Bellingham": 22, "Jamal Musiala": 23,
        "Bukayo Saka": 23, "Florian Wirtz": 23, "Pedri": 22, "Gavi": 21,
        "Endrick": 19, "Arda Güler": 21, "Alejandro Garnacho": 21,
        "Xavi Simons": 23, "Warren Zaïre-Emery": 20, "Kobbie Mainoo": 21,
        "Eduardo Camavinga": 22, "Jeremy Doku": 23, "Cole Palmer": 23,
        "Nico Williams": 23, "Kendry Páez": 18
    }

    TOP_SCORERS = {
        "Kylian Mbappé": 95, "Harry Kane": 95, "Erling Haaland": 95, "Lautaro Martínez": 90,
        "Lionel Messi": 85, "Cristiano Ronaldo": 80, "Jude Bellingham": 80, "Vinícius Júnior": 85,
        "Álvaro Morata": 80, "Julián Álvarez": 80, "Bukayo Saka": 75, "Robert Lewandowski": 85,
        "Ollie Watkins": 75, "Lamine Yamal": 70, "Antoine Griezmann": 75, "Cody Gakpo": 80,
        "Rodrygo": 75, "Victor Osimhen": 85
    }

    TOP_ASSISTERS = {
        "Kevin De Bruyne": 95, "Lionel Messi": 90, "Antoine Griezmann": 85, "Bruno Fernandes": 85,
        "Lamine Yamal": 85, "Nico Williams": 80, "Bukayo Saka": 80, "Vinícius Júnior": 80,
        "Trent Alexander-Arnold": 80, "Jude Bellingham": 75, "Kylian Mbappé": 75, "Bernardo Silva": 80,
        "Florian Wirtz": 85, "Jamal Musiala": 80, "Pedri": 80
    }

    try:
        roster_path = os.path.join(os.path.dirname(__file__), "rosters.json")
        with open(roster_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            for team, players in data.items():
                for p in players:
                    # If they are on the official young stars list, assign their real age
                    if p["name"] in KNOWN_YOUNG_STARS:
                        p["age"] = KNOWN_YOUNG_STARS[p["name"]]
                    else:
                        # Otherwise, STRICTLY force them to be 24-35 so they CANNOT win Best Young Player
                        p["age"] = random.randint(24, 35)
                        
                        # Special cases for older legends
                        if p["name"] in ["Lionel Messi", "Cristiano Ronaldo", "Luka Modrić", "Pepe"]:
                            p["age"] = random.randint(38, 41)
                            
                    # Inject Real-World Scoring & Assisting Data overrides
                    if p["name"] in TOP_SCORERS:
                        p["score_weight"] = TOP_SCORERS[p["name"]]
                    if p["name"] in TOP_ASSISTERS:
                        p["assist_weight"] = TOP_ASSISTERS[p["name"]]
                            
                    init_player(p["name"], team, p["position"], p["age"])
            return data
    except:
        return {}

def track_match_stats(home, away, h_goals, a_goals, h_xg, a_xg, rosters):
    if a_goals == 0:
        gk = next((p for p in rosters.get(home, []) if p["position"] == "GK"), None)
        if gk: GLOBAL_STATS[gk["name"]]["clean_sheets"] += 1
    if h_goals == 0:
        gk = next((p for p in rosters.get(away, []) if p["position"] == "GK"), None)
        if gk: GLOBAL_STATS[gk["name"]]["clean_sheets"] += 1

    # Real-world GK save volume profiles (last 2-3 years)
    GK_SAVE_PROFILES = {
        # High Volume / Elite Shot Stoppers (Avg 3-6 saves per game)
        "Emiliano Martínez": (3, 6), "Gianluigi Donnarumma": (4, 7), "Unai Simón": (3, 6),
        "Alisson": (3, 6), "Mike Maignan": (3, 6), "Jordan Pickford": (3, 7),
        "Thibaut Courtois": (4, 7), "Diogo Costa": (3, 6), "Yassine Bounou": (3, 6),
        # Solid Volume (Avg 2-4 saves per game)
        "Ederson": (2, 4), "Manuel Neuer": (2, 5), "Marc-André ter Stegen": (2, 5),
        "Wojciech Szczęsny": (3, 6), "Dominik Livaković": (3, 6), "Guillermo Ochoa": (4, 8)
    }

    h_gk = next((p for p in rosters.get(home, []) if p["position"] == "GK"), None)
    if h_gk: 
        if h_gk["name"] in GK_SAVE_PROFILES:
            low, high = GK_SAVE_PROFILES[h_gk["name"]]
            saves = random.randint(low, high)
        else:
            saves = random.randint(1, 4)
        # Bonus saves if facing a strong team (high xG)
        if a_xg > 1.5: saves += random.randint(1, 3)
        GLOBAL_STATS[h_gk["name"]]["saves"] += saves
    
    a_gk = next((p for p in rosters.get(away, []) if p["position"] == "GK"), None)
    if a_gk: 
        if a_gk["name"] in GK_SAVE_PROFILES:
            low, high = GK_SAVE_PROFILES[a_gk["name"]]
            saves = random.randint(low, high)
        else:
            saves = random.randint(1, 4)
        if h_xg > 1.5: saves += random.randint(1, 3)
        GLOBAL_STATS[a_gk["name"]]["saves"] += saves

    # Top dribblers globally in the last 2-3 years
    TOP_DRIBBLERS = {
        "Vinícius Júnior": (4, 9), "Lamine Yamal": (3, 8), "Jeremy Doku": (5, 10),
        "Kylian Mbappé": (3, 7), "Jamal Musiala": (4, 8), "Rafael Leão": (4, 8),
        "Khvicha Kvaratskhelia": (3, 7), "Nico Williams": (3, 7), "Lionel Messi": (2, 6),
        "Leroy Sané": (3, 6), "Ousmane Dembélé": (3, 7), "Bukayo Saka": (2, 6), "Luis Díaz": (3, 7)
    }

    for team in [home, away]:
        for player in rosters.get(team, []):
            name = player["name"]
            pos = player["position"]
            if pos in ["FW", "MF"]: 
                if name in TOP_DRIBBLERS:
                    low, high = TOP_DRIBBLERS[name]
                    GLOBAL_STATS[name]["dribbles"] += random.randint(low, high)
                else:
                    GLOBAL_STATS[name]["dribbles"] += random.randint(0, 2)
            if random.random() < 0.15: GLOBAL_STATS[name]["yellow_cards"] += 1
            if random.random() < 0.01: GLOBAL_STATS[name]["red_cards"] += 1

def simulate_match_outcome(home, away):
    # Apply Recent Form Weights & Public Hype (Betting Odds) Multiplier
    adj_elo_h = BASE_ELO_RATINGS.get(home, 1600) * RECENT_FORM_MULTIPLIERS.get(home, 1.0) * PUBLIC_HYPE_MULTIPLIERS.get(home, 1.0)
    adj_elo_a = BASE_ELO_RATINGS.get(away, 1600) * RECENT_FORM_MULTIPLIERS.get(away, 1.0) * PUBLIC_HYPE_MULTIPLIERS.get(away, 1.0)
    
    # Calculate Win Probability (Using divisor 600 for wider, strict gaps)
    e_home = 1 / (1 + 10 ** ((adj_elo_a - adj_elo_h) / 600))
    e_away = 1 - e_home
    
    # Draw probability peaks when teams are equal
    draw_prob = 0.3 * math.exp(-(((adj_elo_h - adj_elo_a)**2) / 200000))
    
    win_prob_h = e_home * (1 - draw_prob)
    win_prob_a = e_away * (1 - draw_prob)

    # Convert probability to Expected Goals (xG)
    # Strong favorites will hit 3.0+ xG. Underdogs will drop to 0.1 xG.
    xg_home = max(0.1, 1.0 + (e_home - 0.5) * 4.5)
    xg_away = max(0.1, 1.0 + (e_away - 0.5) * 4.5)
    
    # Variance Capping: If the gap is massive, mathematically crush the underdog
    if adj_elo_h - adj_elo_a > 800: xg_away = min(xg_away, 0.3)
    if adj_elo_a - adj_elo_h > 800: xg_home = min(xg_home, 0.3)

    home_goals = np.random.poisson(xg_home)
    away_goals = np.random.poisson(xg_away)
    
    probs = {
        "home": round(win_prob_h * 100, 1),
        "away": round(win_prob_a * 100, 1),
        "draw": round(draw_prob * 100, 1)
    }
    
    return home_goals, away_goals, round(xg_home, 2), round(xg_away, 2), probs

def simulate_penalties(home, away):
    adj_elo_h = BASE_ELO_RATINGS.get(home, 1600) * RECENT_FORM_MULTIPLIERS.get(home, 1.0) * PUBLIC_HYPE_MULTIPLIERS.get(home, 1.0)
    adj_elo_a = BASE_ELO_RATINGS.get(away, 1600) * RECENT_FORM_MULTIPLIERS.get(away, 1.0) * PUBLIC_HYPE_MULTIPLIERS.get(away, 1.0)
    
    prob_h = 0.5 + ((adj_elo_h - adj_elo_a) / 1000)
    prob_h = max(0.1, min(0.9, prob_h))
    
    if random.random() < prob_h:
        return {"home": random.randint(4, 5), "away": random.randint(1, 3)}
    else:
        return {"home": random.randint(1, 3), "away": random.randint(4, 5)}

def select_player(roster, weight_key, best_only=False):
    if not roster: return "Unknown Player"
    if best_only: return max(roster, key=lambda p: p[weight_key])["name"]
    names = [p["name"] for p in roster]
    weights = [p[weight_key] for p in roster]
    total = sum(weights)
    if total == 0: return random.choice(names)
    probs = [w / total for w in weights]
    return np.random.choice(names, p=probs)

def generate_events(team, goals, roster, is_extra_time=False):
    events = []
    style = TACTICAL_STYLES.get(team, DEFAULT_STYLE)
    
    for _ in range(goals):
        goal_type = np.random.choice(["open_play", "penalty", "corner"], p=style)
        gx, gy = 120, random.uniform(36, 44)
        
        if goal_type == "penalty":
            scorer = select_player(roster, "score_weight", best_only=True)
            assister = None
            start_pos = None
            mid_pos = {"x": 109, "y": 40}
        elif goal_type == "corner":
            scorer = select_player(roster, "score_weight")
            assister = select_player(roster, "assist_weight")
            if scorer == assister: assister = select_player(roster, "assist_weight")
            start_pos = {"x": 120, "y": random.choice([0, 80])}
            mid_pos = {"x": random.uniform(110, 116), "y": random.uniform(30, 50)}
        else:
            scorer = select_player(roster, "score_weight")
            assister = select_player(roster, "assist_weight")
            if scorer == assister: assister = None
            
            # Realistic Attacking Patterns in the Final Third
            pattern = random.choice(["cutback", "through_ball", "cross", "solo"])
            if not assister: pattern = "solo"
            
            if pattern == "cutback":
                y_side = random.choice([random.uniform(5, 20), random.uniform(60, 75)]) # Wing area
                start_pos = {"x": round(random.uniform(105, 118), 1), "y": round(y_side, 1)} # Deep wing run
                mid_pos = {"x": round(random.uniform(105, 112), 1), "y": round(random.uniform(35, 45), 1)} # Center box
            elif pattern == "cross":
                y_side = random.choice([random.uniform(0, 15), random.uniform(65, 80)])
                start_pos = {"x": round(random.uniform(85, 105), 1), "y": round(y_side, 1)} # Wide cross
                mid_pos = {"x": round(random.uniform(112, 118), 1), "y": round(random.uniform(35, 45), 1)} # Six yard box
            elif pattern == "through_ball":
                start_pos = {"x": round(random.uniform(75, 95), 1), "y": round(random.uniform(25, 55), 1)} # CAM / Center mid pos
                mid_pos = {"x": round(random.uniform(102, 115), 1), "y": round(random.uniform(30, 50), 1)} # Striker run
            elif pattern == "solo":
                start_pos = {"x": round(random.uniform(75, 90), 1), "y": round(random.uniform(20, 60), 1)} # Dribble start
                mid_pos = {"x": round(random.uniform(100, 112), 1), "y": round(random.uniform(30, 50), 1)} # Shoot pos

        if scorer and scorer in GLOBAL_STATS:
            GLOBAL_STATS[scorer]["goals"] += 1
            GLOBAL_STATS[scorer]["points"] += 10
        if assister and assister in GLOBAL_STATS:
            GLOBAL_STATS[assister]["assists"] += 1
            GLOBAL_STATS[assister]["points"] += 5

        minute = random.randint(1, 120) if is_extra_time else random.randint(1, 98)

        events.append({
            "id": str(uuid.uuid4()), "minute": minute, "team": team,
            "goal_type": goal_type, "scorer": scorer, "assister": assister,
            "start_pos": start_pos, "mid_pos": mid_pos, "end_pos": {"x": round(gx, 1), "y": round(gy, 1)}
        })
    return sorted(events, key=lambda x: x["minute"])

def generate_tournament(rosters):
    print("Running Phase 9 ML Prediction Engine (Recent Form Weights Enabled)...")
    tournament_data = {"groups": {}, "knockouts": {}, "statistics": {}, "awards": {}}
    all_teams_stats = []

    for group_name, teams in GROUPS.items():
        standings = {team: {"played": 0, "win": 0, "draw": 0, "loss": 0, "gf": 0, "ga": 0, "gd": 0, "points": 0} for team in teams}
        matches = []
        for i in range(len(teams)):
            for j in range(i + 1, len(teams)):
                home, away = teams[i], teams[j]
                h_goals, a_goals, h_xg, a_xg, probs = simulate_match_outcome(home, away)
                
                track_match_stats(home, away, h_goals, a_goals, h_xg, a_xg, rosters)
                
                standings[home]["played"] += 1; standings[away]["played"] += 1
                standings[home]["gf"] += h_goals; standings[home]["ga"] += a_goals
                standings[away]["gf"] += a_goals; standings[away]["ga"] += h_goals
                standings[home]["gd"] += (h_goals - a_goals); standings[away]["gd"] += (a_goals - h_goals)
                
                if h_goals > a_goals:
                    standings[home]["win"] += 1; standings[home]["points"] += 3; standings[away]["loss"] += 1
                elif h_goals < a_goals:
                    standings[away]["win"] += 1; standings[away]["points"] += 3; standings[home]["loss"] += 1
                else:
                    standings[home]["draw"] += 1; standings[away]["draw"] += 1
                    standings[home]["points"] += 1; standings[away]["points"] += 1
                    
                home_events = generate_events(home, h_goals, rosters.get(home, []))
                away_events = generate_events(away, a_goals, rosters.get(away, []))
                
                matches.append({
                    "id": str(uuid.uuid4()), "home_team": home, "away_team": away,
                    "score": {"home": int(h_goals), "away": int(a_goals)},
                    "xg": {"home": float(h_xg), "away": float(a_xg)},
                    "win_probability": probs,
                    "events": sorted(home_events + away_events, key=lambda x: x["minute"])
                })
                
        sorted_standings = sorted(standings.items(), key=lambda x: (x[1]['points'], x[1]['gd'], x[1]['gf']), reverse=True)
        tournament_data["groups"][group_name] = {
            "standings": [{"team": team, **stats} for team, stats in sorted_standings],
            "matches": matches
        }
        for pos, (team, stats) in enumerate(sorted_standings):
            all_teams_stats.append({"group": group_name, "pos": pos+1, "team": team, "stats": stats})

    top_2 = [t["team"] for t in all_teams_stats if t["pos"] in [1, 2]]
    third_place = [t for t in all_teams_stats if t["pos"] == 3]
    best_thirds = sorted(third_place, key=lambda x: (x['stats']['points'], x['stats']['gd'], x['stats']['gf']), reverse=True)[:8]
    best_thirds_teams = [t["team"] for t in best_thirds]
    
    knockout_32 = top_2 + best_thirds_teams
    random.shuffle(knockout_32)

    champion = None

    def simulate_round(teams_in_round, points_multiplier):
        next_round = []
        matches = []
        for i in range(0, len(teams_in_round), 2):
            home, away = teams_in_round[i], teams_in_round[i+1]
            h_goals, a_goals, h_xg, a_xg, probs = simulate_match_outcome(home, away)
            
            track_match_stats(home, away, h_goals, a_goals, h_xg, a_xg, rosters)
            
            penalties = None
            if h_goals == a_goals:
                penalties = simulate_penalties(home, away)
                winner = home if penalties["home"] > penalties["away"] else away
            else:
                winner = home if h_goals > a_goals else away
                
            next_round.append(winner)
            
            for p in rosters.get(winner, []):
                if p["name"] in GLOBAL_STATS: GLOBAL_STATS[p["name"]]["points"] += (5 * points_multiplier)
            
            is_et = (h_goals == a_goals)
            home_events = generate_events(home, h_goals, rosters.get(home, []), is_extra_time=is_et)
            away_events = generate_events(away, a_goals, rosters.get(away, []), is_extra_time=is_et)
            
            matches.append({
                "id": str(uuid.uuid4()), "home_team": home, "away_team": away,
                "score": {"home": int(h_goals), "away": int(a_goals)}, "penalties": penalties,
                "xg": {"home": float(h_xg), "away": float(a_xg)},
                "win_probability": probs,
                "events": sorted(home_events + away_events, key=lambda x: x["minute"])
            })
        return next_round, matches

    rounds = [("Round of 32", 1), ("Round of 16", 2), ("Quarter-finals", 3), ("Semi-finals", 4), ("Final", 5)]
    current_teams = knockout_32
    for r_name, p_mult in rounds:
        current_teams, matches = simulate_round(current_teams, p_mult)
        tournament_data["knockouts"][r_name] = matches
        if r_name == "Final": champion = current_teams[0]

    players = list(GLOBAL_STATS.values())
    
    tournament_data["statistics"] = {
        "top_scorers": sorted(players, key=lambda x: x["goals"], reverse=True)[:10],
        "top_assists": sorted(players, key=lambda x: x["assists"], reverse=True)[:10],
        "most_dribbles": sorted(players, key=lambda x: x["dribbles"], reverse=True)[:10],
        "most_saves": sorted(players, key=lambda x: x["saves"], reverse=True)[:10],
        "yellow_cards": sorted(players, key=lambda x: x["yellow_cards"], reverse=True)[:10],
        "red_cards": sorted(players, key=lambda x: x["red_cards"], reverse=True)[:10],
    }
    
    golden_boot = tournament_data["statistics"]["top_scorers"][0] if tournament_data["statistics"]["top_scorers"] else None
    golden_ball = sorted(players, key=lambda x: x["points"], reverse=True)[0] if players else None
    
    u23 = [p for p in players if p["age"] <= 23]
    best_young = sorted(u23, key=lambda x: x["points"], reverse=True)[0] if u23 else None
    
    gks = [p for p in players if p["position"] == "GK"]
    golden_glove = sorted(gks, key=lambda x: x["saves"] + (x["clean_sheets"]*5) + (x["points"]/2), reverse=True)[0] if gks else None

    tournament_data["awards"] = {
        "champion": champion,
        "golden_boot": golden_boot,
        "golden_ball": golden_ball,
        "golden_glove": golden_glove,
        "best_young_player": best_young
    }

    return tournament_data

if __name__ == "__main__":
    rosters = load_rosters()
    tournament_data = generate_tournament(rosters)
    
    output_path = os.path.join(os.path.dirname(__file__), "predicted_tournament.json")
    with open(output_path, "w", encoding='utf-8') as f:
        json.dump({"tournament": tournament_data}, f, indent=4, ensure_ascii=False)
    print(f"Tournament simulated and saved to {output_path}")
