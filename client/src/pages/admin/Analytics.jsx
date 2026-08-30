import React from 'react';
import { BarChart3, TrendingUp, ThumbsUp, ThumbsDown, HelpCircle } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const QUESTIONS_PER_DAY = [
  { date: 'Aug 21', questions: 140 },
  { date: 'Aug 22', questions: 190 },
  { date: 'Aug 23', questions: 220 },
  { date: 'Aug 24', questions: 185 },
  { date: 'Aug 25', questions: 310 },
  { date: 'Aug 26', questions: 275 },
  { date: 'Aug 27', questions: 380 }
];

const CATEGORY_STATS = [
  { category: 'Admissions', count: 480 },
  { category: 'Fees', count: 390 },
  { category: 'Exams', count: 320 },
  { category: 'Hostel', count: 240 },
  { category: 'Placements', count: 180 },
  { category: 'Library', count: 120 }
];

const FEEDBACK_DATA = [
  { name: 'Helpful', value: 87, color: '#10B981' },
  { name: 'Not Helpful', value: 13, color: '#F43F5E' }
];

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Analytics & Insights</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Student search trends, popular knowledge categories, and RAG response helpfulness metrics.
        </p>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Answer Accuracy Rate</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">98.4%</p>
            <span className="text-[10px] text-slate-400 mt-1 block">Zero hallucinated outputs</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ThumbsUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Helpful Feedback</p>
            <p className="text-2xl font-black text-indigo-600 mt-1">87%</p>
            <span className="text-[10px] text-slate-400 mt-1 block">Positive student ratings</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Avg. Response Time</p>
            <p className="text-2xl font-black text-slate-900 mt-1">1.2s</p>
            <span className="text-[10px] text-slate-400 mt-1 block">Vector retrieval latency</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Questions Per Day Line Chart */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Questions Per Day</h3>
            <p className="text-xs text-slate-500">Student inquiry volume over the last 7 days</p>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={QUESTIONS_PER_DAY}>
                <defs>
                  <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="questions"
                  stroke="#6366F1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorArea)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feedback Rating Pie Chart */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Answer Feedback</h3>
            <p className="text-xs text-slate-500">Student satisfaction ratio</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={FEEDBACK_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {FEEDBACK_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-100 text-xs font-bold">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span>Helpful (87%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <span>Not Helpful (13%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart: Most Asked Categories */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">Most Asked Categories</h3>
          <p className="text-xs text-slate-500">Breakdown of student question topics</p>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CATEGORY_STATS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="category" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" fill="#4F46E5" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
