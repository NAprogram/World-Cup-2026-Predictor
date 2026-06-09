import React from 'react';

const Dashboard = ({ matchData, onReplayEvent }) => {
    return (
        <div className="bg-white rounded-2xl p-8 mb-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-black">
            <div className="flex justify-between items-center border-b-4 border-black pb-6 mb-6">
                <div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter">
                        {matchData.home_team} <span className="text-gray-400 font-bold mx-2">VS</span> {matchData.away_team}
                    </h2>
                    <div className="flex items-center gap-4 mt-3">
                        <p className="bg-lime-400 border-2 border-black px-3 py-1 font-black uppercase tracking-widest text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            xG: {matchData.xg.home} - {matchData.xg.away}
                        </p>
                        {matchData.win_probability && (
                            <p className="bg-pink-400 text-white border-2 border-black px-3 py-1 font-black uppercase tracking-widest text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                WIN PROB: {matchData.home_team} {matchData.win_probability.home}% | {matchData.away_team} {matchData.win_probability.away}% | DRAW {matchData.win_probability.draw}%
                            </p>
                        )}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-7xl font-black tracking-tighter flex items-center gap-4 justify-end">
                        <span>{matchData.score.home}</span>
                        <span className="text-gray-300">-</span>
                        <span>{matchData.score.away}</span>
                    </div>
                    {matchData.penalties && (
                        <div className="text-lg font-black text-white bg-red-500 uppercase tracking-widest mt-2 px-3 py-1 border-2 border-black inline-block shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            Pens: {matchData.penalties.home} - {matchData.penalties.away}
                        </div>
                    )}
                </div>
            </div>

            <div>
                <h3 className="text-2xl font-black uppercase tracking-widest mb-6">Event Timeline</h3>
                <div className="space-y-4">
                    {matchData.events.length === 0 ? (
                        <p className="text-gray-500 font-bold text-xl uppercase">No goals predicted in regular time.</p>
                    ) : (
                        matchData.events.map((event, idx) => (
                            <div key={idx} className="flex items-center p-4 bg-gray-50 border-2 border-black rounded-xl hover:bg-yellow-200 transition-colors group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <div className="w-16 font-black text-2xl">
                                    {event.minute}'
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className="font-black text-xl">
                                            {event.scorer} 
                                            <span className="text-gray-500 font-bold text-sm ml-2">({event.team})</span>
                                            {event.goal_type === 'penalty' && <span className="ml-3 text-xs uppercase tracking-widest font-black text-white bg-amber-500 px-2 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Penalty</span>}
                                            {event.goal_type === 'corner' && <span className="ml-3 text-xs uppercase tracking-widest font-black text-black bg-lime-400 px-2 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Header</span>}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2 text-sm font-bold text-gray-600">
                                        {event.goal_type === 'penalty' ? (
                                            <span className="italic">Unassisted / Spot Kick</span>
                                        ) : event.assister ? (
                                            <>
                                                <span className="text-blue-600">Assist: {event.assister}</span>
                                                {event.goal_type === 'corner' && <span className="text-xs ml-2 bg-gray-200 px-2 py-0.5 border border-black">(Corner)</span>}
                                            </>
                                        ) : (
                                            <span className="italic">Unassisted / Solo play</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <button 
                                        onClick={() => onReplayEvent(event)}
                                        className={`px-4 py-3 font-black uppercase tracking-widest text-sm border-2 border-black transition-transform hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                                            event.goal_type === 'penalty' ? 'bg-amber-400 text-black' :
                                            event.goal_type === 'corner' ? 'bg-lime-400 text-black' :
                                            'bg-blue-400 text-white'
                                        }`}
                                    >
                                        REPLAY
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
