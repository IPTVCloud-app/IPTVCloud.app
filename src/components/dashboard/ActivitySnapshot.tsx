"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Clock, Activity, Globe } from "lucide-react";

export function ActivitySnapshot() {
  const data = [
    { name: "Sports", value: 42, color: "#5e6ad2" },
    { name: "Movies", value: 30, color: "#7170ff" },
    { name: "News", value: 18, color: "#828fff" },
    { name: "Docs", value: 10, color: "#7a7fad" },
  ];

  return (
    <section className="mb-12">
      <h2 className="text-lg font-medium tracking-[-0.165px] text-primary mb-4">Recent Activity</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-sm font-medium text-secondary mb-6 text-center">Category Breakdown</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#191a1b', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px' }}
                  itemStyle={{ color: '#f7f8f8' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            <div className="text-xs text-tertiary flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-brand inline-block"></span> Sports
            </div>
            <div className="text-xs text-tertiary flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-accent inline-block"></span> Movies
            </div>
          </div>
        </div>

        <div className="md:col-span-2 grid grid-rows-2 gap-6">
          <div className="form-input">
            <div className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center text-accent">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-[15px] font-medium text-primary">Peak Viewing Time</h4>
              <p className="text-sm text-tertiary mt-1">You watch mostly Sports between <strong>8PM–11PM</strong>.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="form-input">
              <div className="flex items-center gap-2 mb-3 text-secondary">
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">Top Region</span>
              </div>
              <div className="text-xl font-medium text-primary">United States</div>
              <div className="text-xs text-tertiary mt-1">65% of your streams</div>
            </div>
            <div className="form-input">
              <div className="flex items-center gap-2 mb-3 text-secondary">
                <Activity className="w-4 h-4" />
                <span className="text-sm font-medium">Recent Device</span>
              </div>
              <div className="text-xl font-medium text-primary">Smart TV</div>
              <div className="text-xs text-tertiary mt-1">Active 12 mins ago</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}