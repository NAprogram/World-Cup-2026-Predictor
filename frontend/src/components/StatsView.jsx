import React from 'react';

const StatsView = ({ data }) => {
    const { awards, statistics } = data;

    const AwardCard = ({ title, player, color, subtitle }) => (
        <div className={`p-6 border-4 border-black ${color} text-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`}>
            <h3 className="text-xl font-black uppercase tracking-widest">{title}</h3>
            {player ? (
                <div className="mt-4">
                    <p className="text-3xl font-bold">{player.name}</p>
                    <p className="text-lg font-bold opacity-80">{player.team} • {player.position}</p>
                    {subtitle && <p className="mt-2 text-sm font-bold bg-black text-white inline-block px-3 py-1 rounded">{subtitle}</p>}
                </div>
            ) : (
                <p className="mt-4 font-bold">TBD</p>
            )}
        </div>
    );

    const StatList = ({ title, list, dataKey, color }) => (
        <div className={`p-6 border-4 border-black bg-white text-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`}>
            <h3 className={`text-xl font-black uppercase tracking-widest mb-4 inline-block px-3 py-1 ${color} border-2 border-black`}>{title}</h3>
            <div className="space-y-3">
                {list.map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b-2 border-black/10 pb-2">
                        <div className="flex items-center gap-3">
                            <span className="font-black text-xl w-6">{idx + 1}.</span>
                            <div>
                                <p className="font-bold">{p.name}</p>
                                <p className="text-xs font-bold text-gray-500">{p.team}</p>
                            </div>
                        </div>
                        <div className={`text-xl font-black ${color} px-3 py-1 border-2 border-black rounded`}>
                            {p[dataKey]}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-12 pb-20">
            <div>
                <h2 className="text-5xl font-black uppercase tracking-tighter text-black mb-8">Official Tournament Awards</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <AwardCard 
                        title="Golden Ball" color="bg-yellow-400" player={awards.golden_ball}
                        subtitle={`${awards.golden_ball.goals} Goals, ${awards.golden_ball.assists} Assists`}
                    />
                    <AwardCard 
                        title="Golden Boot" color="bg-orange-400" player={awards.golden_boot}
                        subtitle={`${awards.golden_boot.goals} Goals Scored`}
                    />
                    <AwardCard 
                        title="Golden Glove" color="bg-cyan-400" player={awards.golden_glove}
                        subtitle={`${awards.golden_glove.saves} Saves, ${awards.golden_glove.clean_sheets} Clean Sheets`}
                    />
                    <AwardCard 
                        title="Best Young Player" color="bg-pink-400" player={awards.best_young_player}
                        subtitle={`Age: ${awards.best_young_player?.age}`}
                    />
                </div>
                
                <div className="mt-8 p-6 border-4 border-black bg-lime-400 text-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-widest">World Cup 2026 Champions</h3>
                        <p className="text-5xl font-black mt-2">{awards.champion}</p>
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-5xl font-black uppercase tracking-tighter text-black mb-8">Global Player Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <StatList title="Top Scorers" list={statistics.top_scorers} dataKey="goals" color="bg-yellow-400" />
                    <StatList title="Top Assists" list={statistics.top_assists} dataKey="assists" color="bg-blue-400" />
                    <StatList title="Most Dribbles" list={statistics.most_dribbles} dataKey="dribbles" color="bg-fuchsia-400" />
                    <StatList title="Most GK Saves" list={statistics.most_saves} dataKey="saves" color="bg-cyan-400" />
                    <StatList title="Yellow Cards" list={statistics.yellow_cards} dataKey="yellow_cards" color="bg-amber-300" />
                    <StatList title="Red Cards" list={statistics.red_cards} dataKey="red_cards" color="bg-red-400" />
                </div>
            </div>
        </div>
    );
};

export default StatsView;
