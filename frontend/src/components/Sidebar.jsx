import React from 'react';

const Sidebar = ({ tournamentData, selectedGroup, onSelectGroup, selectedKnockout, onSelectKnockout, selectedMatch, onSelectMatch, viewMode, setViewMode }) => {
    return (
        <aside className="w-80 bg-violet-600 border-r-8 border-black flex flex-col h-screen fixed left-0 top-0 overflow-y-auto custom-scrollbar text-black">
            <div className="p-6 border-b-8 border-black sticky top-0 bg-violet-600 z-10">
                <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-2 text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    WC 2026
                </h2>
            </div>
            
            <div className="p-4 space-y-6">
                
                {/* AWARDS BUTTON */}
                <button
                    onClick={() => setViewMode('stats')}
                    className={`w-full text-left px-4 py-4 rounded-xl border-4 border-black font-black uppercase tracking-widest text-lg transition-transform hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between ${
                        viewMode === 'stats' ? 'bg-yellow-400 text-black' : 'bg-white text-black'
                    }`}
                >
                    <span>AWARDS & STATS</span>
                </button>

                {/* KNOCKOUTS SECTION */}
                {tournamentData.knockouts && (
                    <div className="bg-white border-4 border-black rounded-xl p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <h3 className="text-sm font-black uppercase tracking-widest mb-3 border-b-4 border-black pb-2">Knockout Stages</h3>
                        <div className="space-y-2">
                            {['Round of 32', 'Round of 16', 'Quarter-finals', 'Semi-finals', 'Final'].map(roundName => {
                                const roundMatches = tournamentData.knockouts[roundName];
                                if (!roundMatches) return null;
                                const isSelected = selectedKnockout === roundName && viewMode === 'tournament';
                                
                                return (
                                    <div key={roundName}>
                                        <button
                                            onClick={() => { setViewMode('tournament'); onSelectKnockout(roundName); }}
                                            className={`w-full text-left px-3 py-2 rounded border-2 border-black font-bold uppercase transition-all ${
                                                isSelected ? 'bg-cyan-400' : 'bg-gray-100 hover:bg-gray-200'
                                            }`}
                                        >
                                            {roundName}
                                        </button>
                                        
                                        {isSelected && (
                                            <div className="mt-2 space-y-2">
                                                {roundMatches.map(match => {
                                                    const isMatchSelected = selectedMatch && selectedMatch.id === match.id;
                                                    return (
                                                        <button
                                                            key={match.id}
                                                            onClick={() => onSelectMatch(match, null)}
                                                            className={`w-full text-left p-2 rounded border-2 border-black transition-all text-sm font-bold ${
                                                                isMatchSelected ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'
                                                            }`}
                                                        >
                                                            <div className="flex justify-between items-center">
                                                                <span className="truncate w-20">{match.home_team}</span>
                                                                <span className={`px-2 py-0.5 border-2 border-black rounded text-xs ${isMatchSelected ? 'bg-white text-black' : 'bg-lime-400'}`}>
                                                                    {match.score.home} - {match.score.away}
                                                                </span>
                                                                <span className="truncate w-20 text-right">{match.away_team}</span>
                                                            </div>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* GROUPS SECTION */}
                <div className="bg-white border-4 border-black rounded-xl p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <h3 className="text-sm font-black uppercase tracking-widest mb-3 border-b-4 border-black pb-2">Group Stage</h3>
                    <div className="space-y-2">
                        {Object.keys(tournamentData.groups).sort().map(groupName => {
                            const group = tournamentData.groups[groupName];
                            const isGroupSelected = selectedGroup === groupName && viewMode === 'tournament';
                            
                            return (
                                <div key={groupName}>
                                    <button
                                        onClick={() => { setViewMode('tournament'); onSelectGroup(groupName); }}
                                        className={`w-full text-left px-3 py-2 rounded border-2 border-black font-bold uppercase transition-all ${
                                            isGroupSelected ? 'bg-pink-400' : 'bg-gray-100 hover:bg-gray-200'
                                        }`}
                                    >
                                        Group {groupName}
                                    </button>
                                    
                                    {isGroupSelected && (
                                        <div className="mt-2 space-y-2">
                                            {group.matches.map(match => {
                                                const isMatchSelected = selectedMatch && selectedMatch.id === match.id;
                                                return (
                                                    <button
                                                        key={match.id}
                                                        onClick={() => onSelectMatch(match, groupName)}
                                                        className={`w-full text-left p-2 rounded border-2 border-black transition-all text-sm font-bold ${
                                                            isMatchSelected ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'
                                                        }`}
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <span className="truncate w-20">{match.home_team}</span>
                                                            <span className={`px-2 py-0.5 border-2 border-black rounded text-xs ${isMatchSelected ? 'bg-white text-black' : 'bg-lime-400'}`}>
                                                                {match.score.home} - {match.score.away}
                                                            </span>
                                                            <span className="truncate w-20 text-right">{match.away_team}</span>
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
                
                {/* ENGINE STATUS (RECENT FORM TRANSPARENCY) - MOVED TO BOTTOM */}
                <div className="bg-black text-white border-4 border-black rounded-xl p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <h3 className="text-xs font-black uppercase tracking-widest text-lime-400 mb-2">Engine Data Weights</h3>
                    <ul className="text-xs font-bold space-y-1 text-gray-300">
                        <li>• World Cup 2022 (20%)</li>
                        <li>• Euro / Copa 2024 (50%)</li>
                        <li>• Friendlies 2yr (30%)</li>
                        <li>• Real-Life Public Hype (Favs)</li>
                        <li>• Extreme Elo Scaling</li>
                    </ul>
                </div>
                
            </div>
        </aside>
    );
};

export default Sidebar;
