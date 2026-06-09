import React from 'react';

const GroupTable = ({ groupName, standings }) => {
    return (
        <div className="bg-white rounded-2xl p-8 mb-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-black">
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-6 flex items-center gap-4">
                <span className="bg-pink-400 px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">Group {groupName}</span>
                <span className="text-xl text-gray-400">Official Standings</span>
            </h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b-4 border-black text-gray-500 uppercase tracking-widest text-sm font-black">
                            <th className="p-4 w-12 text-center">#</th>
                            <th className="p-4">Nation</th>
                            <th className="p-4 text-center">Played</th>
                            <th className="p-4 text-center">W</th>
                            <th className="p-4 text-center">D</th>
                            <th className="p-4 text-center">L</th>
                            <th className="p-4 text-center">GF</th>
                            <th className="p-4 text-center">GA</th>
                            <th className="p-4 text-center">GD</th>
                            <th className="p-4 text-center text-xl text-black">Pts</th>
                        </tr>
                    </thead>
                    <tbody className="font-bold">
                        {standings.map((team, idx) => (
                            <tr key={team.team} className={`border-b-2 border-gray-200 transition-colors hover:bg-gray-100 ${idx < 2 ? 'bg-lime-50' : ''}`}>
                                <td className="p-4 text-center">
                                    <span className={`w-8 h-8 flex items-center justify-center rounded-full border-2 border-black font-black ${
                                        idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-gray-300' : 'bg-white text-gray-500'
                                    }`}>
                                        {idx + 1}
                                    </span>
                                </td>
                                <td className="p-4 text-lg font-black uppercase tracking-wide">
                                    {team.team}
                                    {idx < 2 && <span className="ml-3 text-xs bg-lime-400 border border-black px-2 py-0.5 rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">ADVANCES</span>}
                                </td>
                                <td className="p-4 text-center">{team.played}</td>
                                <td className="p-4 text-center text-green-600">{team.win}</td>
                                <td className="p-4 text-center text-gray-500">{team.draw}</td>
                                <td className="p-4 text-center text-red-500">{team.loss}</td>
                                <td className="p-4 text-center">{team.gf}</td>
                                <td className="p-4 text-center">{team.ga}</td>
                                <td className="p-4 text-center">{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                                <td className="p-4 text-center text-2xl font-black">{team.points}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GroupTable;
