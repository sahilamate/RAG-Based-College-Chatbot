import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { documentService } from '../../services/documentService';
import {
  FileText,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Users,
  MessageSquare,
  Layers,
  UploadCloud,
  ArrowUpRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const ACTIVITY_DATA = [
  { day: 'Mon', questions: 180, uploads: 3 },
  { day: 'Tue', questions: 240, uploads: 5 },
  { day: 'Wed', questions: 310, uploads: 2 },
  { day: 'Thu', questions: 280, uploads: 4 },
  { day: 'Fri', questions: 390, uploads: 8 },
  { day: 'Sat', questions: 120, uploads: 1 },
  { day: 'Sun', questions: 95, uploads: 0 }
];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentDocs, setRecentDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const data = await documentService.getDashboardStats();
        const docsData = await documentService.getDocuments({ limit: 5 });
        setStats(data);
        setRecentDocs(docsData.documents || []);
      } catch (err) {
        console.error('[Dashboard] Load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Welcome Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Admin Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time overview of college PDF documents, upload storage, and system metrics.
          </p>
        </div>

        <Link to="/admin/documents/upload">
          <button className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 inline-flex items-center gap-2 transition-all">
            <UploadCloud className="w-4 h-4" />
            Upload Document
          </button>
        </Link>
      </div>

      {/* KPI Cards Grid 1: Document Upload Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Documents
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats?.totalDocuments || 0}</p>
            <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5 mt-1">
              <TrendingUp className="w-3 h-3" /> Live MongoDB Count
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status: Uploaded</p>
            <p className="text-2xl font-black text-indigo-600 mt-1">{stats?.uploadedDocuments || stats?.totalDocuments || 0}</p>
            <span className="text-[10px] text-slate-400 mt-1 block">Stored in /uploads</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Processed</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{stats?.processedDocuments || 0}</p>
            <span className="text-[10px] text-slate-400 mt-1 block">Future RAG stage</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Failed</p>
            <p className="text-2xl font-black text-rose-600 mt-1">{stats?.failedDocuments || 0}</p>
            <span className="text-[10px] text-slate-400 mt-1 block">Storage errors</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* KPI Cards Grid 2: Platform Usage Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300">Total Students</span>
            <Users className="w-4 h-4 text-indigo-300" />
          </div>
          <p className="text-3xl font-black">{stats?.totalUsers || 0}</p>
          <p className="text-[11px] text-slate-300">Registered student accounts</p>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300">Questions Asked</span>
            <MessageSquare className="w-4 h-4 text-indigo-300" />
          </div>
          <p className="text-3xl font-black">{stats?.totalQuestions || 0}</p>
          <p className="text-[11px] text-slate-300">Student queries in MongoDB</p>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300">Total Chunks</span>
            <Layers className="w-4 h-4 text-indigo-300" />
          </div>
          <p className="text-3xl font-black">{stats?.totalChunks || 0}</p>
          <p className="text-[11px] text-slate-300">Indexed vector embeddings</p>
        </div>
      </div>

      {/* Activity Chart Section */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Query & Upload Volume</h3>
            <p className="text-xs text-slate-500">Weekly student interaction trends</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
            This Week
          </span>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ACTIVITY_DATA}>
              <defs>
                <linearGradient id="colorQuestions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="questions"
                stroke="#4F46E5"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorQuestions)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Documents Table */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900">Recent Uploaded PDFs</h3>
          <Link to="/admin/documents" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
            View All Documents <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentDocs.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No uploaded documents found yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Document Title</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">File Size</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {recentDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-800">{doc.title}</td>
                    <td className="py-3 px-3 text-slate-600">{doc.department}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                        {doc.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono">
                      {doc.fileSize ? (doc.fileSize / (1024 * 1024)).toFixed(2) + ' MB' : 'N/A'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
                        Uploaded
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
