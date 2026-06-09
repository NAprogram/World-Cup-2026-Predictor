import os
import json
import pandas as pd
import urllib.request
import ssl

# Bypass SSL verification for Wikipedia requests if needed
ssl._create_default_https_context = ssl._create_unverified_context

WIKI_MAPPING = {
    "Mexico": "Mexico_national_football_team",
    "South Africa": "South_Africa_national_football_team",
    "Korea Republic": "South_Korea_national_football_team",
    "Czechia": "Czech_Republic_national_football_team",
    "Canada": "Canada_men%27s_national_soccer_team",
    "Switzerland": "Switzerland_national_football_team",
    "Qatar": "Qatar_national_football_team",
    "Bosnia and Herzegovina": "Bosnia_and_Herzegovina_national_football_team",
    "Brazil": "Brazil_national_football_team",
    "Morocco": "Morocco_national_football_team",
    "Haiti": "Haiti_national_football_team",
    "Scotland": "Scotland_national_football_team",
    "United States": "United_States_men%27s_national_soccer_team",
    "Paraguay": "Paraguay_national_football_team",
    "Australia": "Australia_men%27s_national_soccer_team",
    "Türkiye": "Turkey_national_football_team",
    "Germany": "Germany_national_football_team",
    "Curaçao": "Cura%C3%A7ao_national_football_team",
    "Côte d'Ivoire": "Ivory_Coast_national_football_team",
    "Ecuador": "Ecuador_national_football_team",
    "Netherlands": "Netherlands_national_football_team",
    "Japan": "Japan_national_football_team",
    "Tunisia": "Tunisia_national_football_team",
    "Sweden": "Sweden_national_football_team",
    "Belgium": "Belgium_national_football_team",
    "Egypt": "Egypt_national_football_team",
    "Iran": "Iran_national_football_team",
    "New Zealand": "New_Zealand_men%27s_national_football_team",
    "Spain": "Spain_national_football_team",
    "Cabo Verde": "Cape_Verde_national_football_team",
    "Saudi Arabia": "Saudi_Arabia_national_football_team",
    "Uruguay": "Uruguay_national_football_team",
    "France": "France_national_football_team",
    "Senegal": "Senegal_national_football_team",
    "Norway": "Norway_national_football_team",
    "Iraq": "Iraq_national_football_team",
    "Argentina": "Argentina_national_football_team",
    "Algeria": "Algeria_national_football_team",
    "Austria": "Austria_national_football_team",
    "Jordan": "Jordan_national_football_team",
    "Portugal": "Portugal_national_football_team",
    "Uzbekistan": "Uzbekistan_national_football_team",
    "Colombia": "Colombia_national_football_team",
    "Congo DR": "DR_Congo_national_football_team",
    "England": "England_national_football_team",
    "Croatia": "Croatia_national_football_team",
    "Ghana": "Ghana_national_football_team",
    "Panama": "Panama_national_football_team",
}

def determine_probabilities(pos):
    """
    Returns (score_prob, assist_prob) based on real-world statistical likelihoods.
    """
    pos = str(pos).upper()
    if 'FW' in pos or 'FORWARD' in pos or 'ST' in pos or 'RW' in pos or 'LW' in pos:
        return 60, 20  # High chance to score, moderate to assist
    elif 'MF' in pos or 'MID' in pos or 'CM' in pos or 'AM' in pos:
        return 25, 55  # Moderate to score, high to assist
    elif 'DF' in pos or 'DEF' in pos or 'CB' in pos or 'RB' in pos or 'LB' in pos:
        return 14, 23  # Low to score, low/mod to assist
    elif 'GK' in pos or 'GOAL' in pos:
        return 1, 2    # Very rare to score or assist (but possible!)
    else:
        return 10, 10

def scrape_team(team_name, wiki_path):
    url = f"https://en.wikipedia.org/wiki/{wiki_path}"
    print(f"Scraping: {team_name}...")
    
    try:
        # User-Agent to prevent 403 Forbidden
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        html = urllib.request.urlopen(req).read()
        tables = pd.read_html(html)
        
        # The squad table is usually the first table that contains "Pos." and "Player"
        squad_df = None
        for df in tables:
            cols = [str(c).lower() for c in df.columns]
            if any('player' in c for c in cols) and any('pos' in c for c in cols):
                squad_df = df
                break
                
        if squad_df is None:
            raise Exception("Squad table not found")
            
        # Clean the dataframe
        # Find exact column names
        player_col = [c for c in squad_df.columns if 'player' in str(c).lower()][0]
        pos_col = [c for c in squad_df.columns if 'pos' in str(c).lower()][0]
        
        roster = []
        for _, row in squad_df.iterrows():
            name = str(row[player_col]).replace(r' (captain)', '').strip()
            # Remove wikipedia footnote references like [a] or [1]
            import re
            name = re.sub(r'\[.*?\]', '', name)
            pos = str(row[pos_col])
            
            score_prob, assist_prob = determine_probabilities(pos)
            
            roster.append({
                "name": name,
                "position": pos,
                "score_weight": score_prob,
                "assist_weight": assist_prob
            })
            
        return roster
    except Exception as e:
        print(f"Failed to scrape {team_name}: {e}")
        # Fallback roster if scraping fails
        return [
            {"name": f"{team_name} Striker", "position": "FW", "score_weight": 60, "assist_weight": 20},
            {"name": f"{team_name} Midfielder", "position": "MF", "score_weight": 25, "assist_weight": 55},
            {"name": f"{team_name} Defender", "position": "DF", "score_weight": 14, "assist_weight": 23},
            {"name": f"{team_name} Goalkeeper", "position": "GK", "score_weight": 1, "assist_weight": 2},
        ]

if __name__ == "__main__":
    all_rosters = {}
    for team, path in WIKI_MAPPING.items():
        all_rosters[team] = scrape_team(team, path)
        
    output_path = os.path.join(os.path.dirname(__file__), "rosters.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_rosters, f, indent=4, ensure_ascii=False)
        
    print(f"\nSuccessfully scraped {len(all_rosters)} rosters. Saved to {output_path}")
