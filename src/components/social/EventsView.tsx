import React from 'react';
import { Calendar, Flame, Trophy, Sparkles, Clock, Users } from 'lucide-react';
import { LiveEvent } from '../../types';

interface EventsViewProps {
  events: LiveEvent[];
}

export const EventsView: React.FC<EventsViewProps> = ({ events }) => {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-2">
          <Calendar className="w-6 h-6 text-amber-400" />
          Live Events & Game Jams
        </h1>
        <p className="text-xs text-slate-400">Participate in universe events, creator competitions, and tournament festivals</p>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((evt) => (
          <div key={evt.id} className="relative bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between">
            <div className="relative h-48 w-full bg-slate-950">
              <img src={evt.bannerUrl} alt={evt.title} className="w-full h-full object-cover filter brightness-90" />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-black text-xs shadow-lg flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-slate-950" />
                LIVE UNIVERSE EVENT
              </div>
            </div>

            <div className="p-5 space-y-3">
              <div>
                <h3 className="text-lg font-black text-white">{evt.title}</h3>
                <p className="text-xs text-slate-300 mt-1">{evt.description}</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs text-amber-300 font-bold">
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Rewards: {evt.rewardsDescription}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Ends in 3 days</span>
                </div>
              </div>

              <button className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs shadow-lg cursor-pointer">
                JOIN EVENT EXPERIENCE
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
