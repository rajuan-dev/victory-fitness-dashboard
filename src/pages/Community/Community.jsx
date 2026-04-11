import React, { useState } from 'react';
import { FaImage, FaPlus } from 'react-icons/fa';
import { BiBroadcast } from 'react-icons/bi';

const Community = () => {
  const [tier, setTier] = useState('All Users (Global)');
  const [message, setMessage] = useState('');

  const activities = [
    {
      id: 1,
      author: 'Admin',
      avatar: 'A',
      date: '26/03/2026, 13:37:27',
      tierBadge: 'ALL',
      content: "🏆 Challenge 'Kindness Sprint' gemeistert! Ein super Gefühl, das Ziel zu erreichen. Wer ist als nächstes dran? #ChallengeAccepted"
    },
    {
      id: 2,
      author: 'Admin',
      avatar: 'A',
      date: '28/03/2026, 01:19:05',
      tierBadge: 'ALL',
      content: "how are you"
    }
  ];

  return (
    <div className="flex flex-col space-y-8 pt-2 h-full text-slate-100 w-full pb-10">
      
      {/* Broadcast Card */}
      <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-5 md:p-6 shadow-xl relative overflow-hidden">
        
        <div className="flex items-center gap-2 mb-6">
          <BiBroadcast className="text-teal-400 text-2xl" />
          <h2 className="text-lg font-bold text-teal-400">Send Tier Broadcast</h2>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-tight mb-2">TARGET TIER</label>
            <select 
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="w-full bg-[#0f172a] border border-[#334155] text-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 cursor-pointer"
              style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none', backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="%2394a3b8" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
            >
              <option>All Users (Global)</option>
              <option>Premium Members</option>
              <option>Beginners</option>
            </select>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-2">PHOTO</label>
              <button className="flex items-center justify-center gap-2 bg-[#0f172a] hover:bg-[#151e32] border border-[#334155] transition-colors rounded-lg px-4 py-2.5 text-sm text-slate-300 w-full md:w-auto h-[46px]">
                <FaImage className="text-slate-400" /> Add
              </button>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-2">VIDEO</label>
              <button className="flex items-center justify-center gap-2 bg-[#0f172a] hover:bg-[#151e32] border border-[#334155] transition-colors rounded-lg px-4 py-2.5 text-sm text-slate-300 w-full md:w-auto h-[46px]">
                <FaPlus className="text-slate-400 text-xs" /> Add
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-tight mb-2">MESSAGE CONTENT</label>
          <textarea 
            rows={4}
            placeholder="Share tips, notes, or announcements with this tier..."
            className="w-full bg-[#0f172a] border border-[#334155] text-slate-200 rounded-lg p-4 outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 resize-y placeholder:text-slate-500"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>
        </div>

        <button className="w-full bg-[#283648] hover:bg-[#33445a] text-[#718eb2] hover:text-[#94b5dd] font-semibold py-3 rounded-lg transition-colors border border-[#324357]">
          Send Broadcast to Tier
        </button>
      </div>

      {/* Activity Section */}
      <div>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h2 className="text-xl font-bold text-white tracking-wide">Recent Community Activity</h2>
          <span className="bg-[#243142] border border-[#334155] text-slate-400 text-[11px] font-semibold px-3 py-1 rounded-full cursor-pointer hover:bg-[#2a374a] transition-colors">
            Manage Posts
          </span>
        </div>

        <div className="space-y-3">
          {activities.map(activity => (
            <div key={activity.id} className="bg-[#1e293b] border border-[#334155] rounded-xl p-4 flex flex-col hover:border-slate-500 transition-colors relative group">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0cd7d3] flex items-center justify-center font-bold text-[#0f172a] text-sm shrink-0">
                      {activity.avatar}
                    </div>
                    <span className="font-semibold text-white text-sm">{activity.author}</span>
                    <span className="text-[11px] text-slate-400">{activity.date}</span>
                    <span className="bg-[#2a374a] text-[#9baec2] text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      {activity.tierBadge}
                    </span>
                  </div>
                  <p className="text-[13px] text-slate-300 pl-11">{activity.content}</p>
                </div>
                
                <button className="text-slate-500 hover:text-slate-300 p-1 group-hover:scale-110 transition-transform">
                  <FaPlus className="text-xs" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
};

export default Community;
