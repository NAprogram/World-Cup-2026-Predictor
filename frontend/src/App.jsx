import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Pitch from './components/Pitch';
import Sidebar from './components/Sidebar';
import GroupTable from './components/GroupTable';
import StatsView from './components/StatsView';
import './index.css';

function App() {
  const [tournamentData, setTournamentData] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedKnockout, setSelectedKnockout] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [replayEvent, setReplayEvent] = useState(null);
  const [viewMode, setViewMode] = useState('tournament'); // 'tournament' or 'stats'
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    // Initial load from the local JSON file
    import('./predicted_tournament.json')
      .then(module => {
        setTournamentData(module.default);
        const groups = Object.keys(module.default.tournament.groups).sort();
        if (groups.length > 0) {
            const initialGroup = groups[0];
            setSelectedGroup(initialGroup);
            setSelectedMatch(module.default.tournament.groups[initialGroup].matches[0]);
        }
      })
      .catch((e) => {
        console.error("Error loading tournament data.", e);
      });
  }, []);

  const handleGroupSelect = (groupName) => {
      setSelectedGroup(groupName === selectedGroup ? null : groupName);
      setSelectedKnockout(null);
  };

  const handleKnockoutSelect = (roundName) => {
      setSelectedKnockout(roundName === selectedKnockout ? null : roundName);
      setSelectedGroup(null);
  };

  const handleMatchSelect = (match, groupName) => {
      setSelectedMatch(match);
      setReplayEvent(null);
      if (groupName) {
          setSelectedGroup(groupName);
          setSelectedKnockout(null);
      }
  };

  const handleReplayEvent = (event) => {
      setReplayEvent(null);
      setTimeout(() => setReplayEvent(event), 50);
  };

  const handleResimulate = async () => {
      if (isSimulating) return;
      setIsSimulating(true);
      try {
          // Fetch from the Node.js API server (handles both localhost and production deployment)
          const apiUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
              ? 'http://localhost:3001/api/simulate' 
              : '/api/simulate';
              
          const response = await fetch(apiUrl, {
              method: 'POST'
          });
          
          if (!response.ok) throw new Error("API Request Failed");
          
          const newData = await response.json();
          setTournamentData(newData);
          
          // Re-select initial state
          const groups = Object.keys(newData.tournament.groups).sort();
          if (groups.length > 0) {
              const initialGroup = groups[0];
              setSelectedGroup(initialGroup);
              setSelectedKnockout(null);
              setSelectedMatch(newData.tournament.groups[initialGroup].matches[0]);
              setViewMode('tournament');
          }
      } catch (err) {
          console.error(err);
          alert("Failed to resimulate. Ensure the Node.js backend API is running on port 3001.");
      } finally {
          setIsSimulating(false);
      }
  };

  if (!tournamentData) return <div className="font-black p-10 flex justify-center items-center h-screen text-4xl text-black bg-pink-400">LOADING ENGINE...</div>;

  const activeGroupData = selectedGroup ? tournamentData.tournament.groups[selectedGroup] : null;

  return (
    <div className="min-h-screen bg-fuchsia-200 flex font-sans text-black">
      
      {/* Loading Overlay */}
      {isSimulating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
              <div className="bg-lime-400 p-10 border-8 border-black shadow-[15px_15px_0px_0px_rgba(255,255,255,1)] transform -rotate-2">
                  <h2 className="text-6xl font-black uppercase tracking-tighter text-black animate-pulse">Running ML Engine...</h2>
                  <p className="text-xl font-bold uppercase mt-4 text-center">Predicting 72 Matches</p>
              </div>
          </div>
      )}

      <Sidebar 
        tournamentData={tournamentData.tournament}
        selectedGroup={selectedGroup}
        onSelectGroup={handleGroupSelect}
        selectedKnockout={selectedKnockout}
        onSelectKnockout={handleKnockoutSelect}
        selectedMatch={selectedMatch} 
        onSelectMatch={handleMatchSelect}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <div className="flex-1 p-8 ml-80 overflow-y-auto">
        <header className="mb-10 flex justify-between items-end border-b-8 border-black pb-6">
            <div>
                <h1 className="text-7xl font-black text-black uppercase tracking-tighter drop-shadow-[4px_4px_0px_rgba(255,255,255,1)]">
                FIFA World Cup 26
                </h1>
                <p className="bg-black text-lime-400 inline-block px-3 py-1 text-xl font-bold uppercase tracking-widest mt-2 border-2 border-white">Simulator</p>
            </div>
            <div className="text-right flex flex-col items-end gap-3">
                <button 
                    onClick={handleResimulate}
                    disabled={isSimulating}
                    className="bg-red-500 hover:bg-red-400 text-white font-black uppercase tracking-widest px-6 py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 active:translate-y-0 active:shadow-none"
                >
                    RESIMULATE TOURNAMENT
                </button>
            </div>
        </header>

        <main className="max-w-6xl mx-auto space-y-8">
          
          {viewMode === 'stats' ? (
              <StatsView data={tournamentData.tournament} />
          ) : (
              <>
                {activeGroupData && (
                    <GroupTable groupName={selectedGroup} standings={activeGroupData.standings} />
                )}

                {selectedMatch && (
                    <>
                        <Dashboard matchData={selectedMatch} onReplayEvent={handleReplayEvent} />
                        
                        <div className="bg-cyan-400 p-2 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black relative overflow-hidden">
                            <div className="p-6 relative z-10 bg-white rounded-xl border-4 border-black">
                                <div className="flex justify-between items-center mb-6 border-b-4 border-black pb-4">
                                    <h3 className="text-2xl font-black text-black uppercase flex items-center gap-3">
                                        <span className={`w-4 h-4 border-2 border-black ${replayEvent ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></span>
                                        {replayEvent ? 'REPLAY ACTIVE' : 'SELECT A GOAL TO REPLAY'}
                                    </h3>
                                </div>
                                
                                <Pitch replayEvent={replayEvent} />
                                
                                <div className="mt-6 flex justify-between text-black font-bold uppercase text-sm border-t-4 border-black pt-4">
                                    <span className="bg-yellow-400 px-2 py-1 border-2 border-black">Status: {replayEvent ? `ANIMATING GOAL ${replayEvent.minute}'` : 'IDLE'}</span>
                                    <span className="bg-pink-400 px-2 py-1 border-2 border-black">Target: {selectedMatch.home_team} VS {selectedMatch.away_team}</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
              </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
