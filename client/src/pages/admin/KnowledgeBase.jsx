import React, { useState, useEffect } from 'react';
import { vectorSearchService } from '../../services/vectorSearchService';
import { ragService } from '../../services/ragService';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/common/Button';
import {
  Search,
  Sparkles,
  Database,
  FileText,
  CheckCircle2,
  AlertCircle,
  Layers,
  Code,
  Info,
  ShieldAlert,
  Sliders
} from 'lucide-react';

const DEPARTMENTS = [
  'All Departments',
  'General College',
  'Computer Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electronics & Comm.'
];

const CATEGORIES = [
  'All',
  'Admissions',
  'Academics',
  'Fees',
  'Exams',
  'Hostel',
  'Library',
  'Scholarships',
  'Placements',
  'Policies',
  'Events',
  'Other'
];

const KnowledgeBase = () => {
  const [activeTab, setActiveTab] = useState('rag'); // 'rag' | 'vector'
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState('All Departments');
  const [category, setCategory] = useState('All');

  // Vector Search Test States
  const [vectorLimit, setVectorLimit] = useState(5);
  const [vectorMinScore, setVectorMinScore] = useState(0.60);
  const [vectorResults, setVectorResults] = useState([]);
  const [vectorMeta, setVectorMeta] = useState(null);
  const [vectorLoading, setVectorLoading] = useState(false);

  // RAG Pipeline Test States
  const [ragRetrievalLimit, setRagRetrievalLimit] = useState(8);
  const [ragMinScore, setRagMinScore] = useState(0.70);
  const [ragResult, setRagResult] = useState(null);
  const [ragLoading, setRagLoading] = useState(false);

  const [health, setHealth] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchHealth = async () => {
      const hData = await vectorSearchService.getVectorSearchHealth();
      setHealth(hData);
    };
    fetchHealth();
  }, []);

  // Handle Vector Search Test
  const handleVectorSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      addToast('Please enter a query', 'error');
      return;
    }

    setVectorLoading(true);
    try {
      const data = await vectorSearchService.testQuerySearch(query.trim(), {
        limit: vectorLimit,
        minScore: vectorMinScore,
        department,
        category
      });
      setVectorResults(data.results);
      setVectorMeta({
        query: data.query,
        model: data.model,
        count: data.resultsCount
      });
    } catch (err) {
      addToast(err.message || 'Vector search query failed', 'error');
    } finally {
      setVectorLoading(false);
    }
  };

  // Handle RAG Retrieval Pipeline Test
  const handleRagRetrieve = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      addToast('Please enter a question for RAG retrieval', 'error');
      return;
    }

    setRagLoading(true);
    try {
      const data = await ragService.retrieveContext(query.trim(), {
        retrievalLimit: ragRetrievalLimit,
        minScore: ragMinScore,
        department,
        category
      });
      setRagResult(data);
    } catch (err) {
      addToast(err.message || 'RAG retrieval failed', 'error');
    } finally {
      setRagLoading(false);
    }
  };

  const handleQuickSample = (sampleText) => {
    setQuery(sampleText);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">RAG Knowledge Base & Retrieval</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Test semantic vector search and inspect the RAG context constructed for the LLM.
          </p>
        </div>

        {health && (
          <div className="px-3.5 py-2 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-600" />
            <span>
              {health.totalEmbeddedChunks} Chunks Ready ({health.readyDocuments} Documents)
            </span>
          </div>
        )}
      </div>

      {/* Mode Switch Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-200/70 rounded-2xl w-fit text-xs font-extrabold">
        <button
          type="button"
          onClick={() => setActiveTab('rag')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'rag'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          RAG Retrieval Pipeline Test
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('vector')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'vector'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Vector Search Test
        </button>
      </div>

      {/* TAB 1: RAG RETRIEVAL PIPELINE TEST */}
      {activeTab === 'rag' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span className="text-xs font-black tracking-wider uppercase text-indigo-300">
                  RAG Context Retrieval Pipeline Test
                </span>
              </div>
              <p className="text-xs text-indigo-200/80">
                Executes: Query Validation → Query Embedding → MongoDB Vector Search → Relevance Filtering (Score ≥ {ragMinScore}) → Context Construction for LLM.
              </p>
            </div>

            {/* Quick Sample Chips */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[11px] font-bold text-indigo-300">Quick Samples:</span>
              <button
                type="button"
                onClick={() => handleQuickSample('What is the minimum attendance requirement for students?')}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-indigo-200 text-[11px] font-semibold transition-colors"
              >
                "Attendance requirement"
              </button>
              <button
                type="button"
                onClick={() => handleQuickSample('How much is the hostel fee per academic year?')}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-indigo-200 text-[11px] font-semibold transition-colors"
              >
                "Hostel fee structure"
              </button>
              <button
                type="button"
                onClick={() => handleQuickSample('What is the population of Mars today?')}
                className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-[11px] font-semibold transition-colors border border-rose-500/30"
              >
                "Population of Mars" (Anti-Hallucination Test)
              </button>
            </div>

            <form onSubmit={handleRagRetrieve} className="space-y-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ask a question (e.g. What is the minimum attendance requirement for students?)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-2xl bg-white text-slate-900 pl-12 pr-4 py-3.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-md"
                />
              </div>

              {/* RAG Filter Configuration Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-white/20 px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-white/20 px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1">
                    Candidate Pool Size
                  </label>
                  <select
                    value={ragRetrievalLimit}
                    onChange={(e) => setRagRetrievalLimit(parseInt(e.target.value, 10))}
                    className="w-full rounded-xl bg-slate-900 border border-white/20 px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value={5}>Top 5 Candidates</option>
                    <option value={8}>Top 8 Candidates (Default)</option>
                    <option value={12}>Top 12 Candidates</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1">
                    Min Relevance Score
                  </label>
                  <select
                    value={ragMinScore}
                    onChange={(e) => setRagMinScore(parseFloat(e.target.value))}
                    className="w-full rounded-xl bg-slate-900 border border-white/20 px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value={0.60}>0.60 (Relaxed)</option>
                    <option value={0.70}>0.70 (Strict Grounding - Default)</option>
                    <option value={0.80}>0.80 (Very High Precision)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={ragLoading}
                  disabled={ragLoading || !query.trim()}
                  icon={Sparkles}
                >
                  {ragLoading ? 'Executing RAG Pipeline...' : 'Retrieve Context for LLM'}
                </Button>
              </div>
            </form>
          </div>

          {/* RAG Retrieval Results Section */}
          {ragResult && (
            <div className="space-y-6">
              {/* Status Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2">
                  {ragResult.hasContext ? (
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Grounded Context Found (hasContext = true)
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-600" />
                      Unknown State (hasContext = false)
                    </span>
                  )}
                </div>

                {/* Retrieval Debug Metrics */}
                <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-600">
                  <span>Candidates Pool: {ragResult.stats?.retrievalCount || 0}</span>
                  <span>•</span>
                  <span>Passed Filter (≥{ragMinScore}): {ragResult.stats?.filteredCount || 0}</span>
                  <span>•</span>
                  <span>Top Score: {ragResult.stats?.topScore || 0}</span>
                  <span>•</span>
                  <span>Context Size: {ragResult.stats?.contextChars || 0} chars</span>
                </div>
              </div>

              {/* No Context Warning if unknown state */}
              {!ragResult.hasContext && (
                <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    <span>No Relevant College Information Found</span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    {ragResult.message || 'No vector chunks matched the minimum relevance threshold.'}
                  </p>
                  <p className="text-[11px] font-mono text-amber-700 mt-2">
                    Anti-Hallucination Enforced: The future LLM layer will receive hasContext: false and will answer "I couldn't find this information in the college knowledge base." rather than hallucinating an answer.
                  </p>
                </div>
              )}

              {/* CONTEXT PREVIEW BOX (Exact payload sent to LLM) */}
              {ragResult.hasContext && ragResult.context && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Code className="w-4 h-4 text-indigo-600" />
                      Exact RAG Context Payload (Sent to LLM Prompt)
                    </h3>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {ragResult.stats?.contextChars} chars • {ragResult.stats?.contextTokens || 0} approx tokens
                    </span>
                  </div>
                  <pre className="p-5 rounded-3xl bg-slate-900 text-indigo-100 font-mono text-xs leading-relaxed border border-slate-800 overflow-x-auto max-h-96">
                    {ragResult.context}
                  </pre>
                </div>
              )}

              {/* INDIVIDUAL SOURCE CHUNKS LIST */}
              {ragResult.chunks && ragResult.chunks.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 px-2">
                    Included Source Chunks ({ragResult.chunks.length})
                  </h3>

                  <div className="space-y-3">
                    {ragResult.chunks.map((chunk, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3 relative overflow-hidden"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                              #{idx + 1}
                            </span>
                            <div>
                              <h4 className="text-xs font-extrabold text-slate-900">{chunk.documentTitle}</h4>
                              <span className="text-[11px] text-slate-400 font-mono">
                                {chunk.originalFileName} • {chunk.category}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs">
                              Page {chunk.pageNumber}
                            </span>
                            <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-indigo-700 font-bold text-xs">
                              Chunk #{chunk.chunkIndex}
                            </span>
                            <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-black text-xs">
                              Relevance: {chunk.relevanceScore}
                            </span>
                          </div>
                        </div>

                        <pre className="text-xs text-slate-800 font-sans whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          {chunk.text}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: VECTOR SEARCH TEST */}
      {activeTab === 'vector' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white shadow-xl space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span className="text-xs font-black tracking-wider uppercase text-indigo-300">
                  Vector Search Test
                </span>
              </div>
              <p className="text-xs text-indigo-200/80">
                Directly tests vector similarity search on DocumentChunks without context building.
              </p>
            </div>

            <form onSubmit={handleVectorSearch} className="space-y-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. What is the minimum attendance requirement for students?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-2xl bg-white text-slate-900 pl-12 pr-4 py-3.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-md"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-white/20 px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-white/20 px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1">
                    Top K Limit
                  </label>
                  <select
                    value={vectorLimit}
                    onChange={(e) => setVectorLimit(parseInt(e.target.value, 10))}
                    className="w-full rounded-xl bg-slate-900 border border-white/20 px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value={3}>Top 3</option>
                    <option value={5}>Top 5</option>
                    <option value={10}>Top 10</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1">
                    Min Score Threshold
                  </label>
                  <select
                    value={vectorMinScore}
                    onChange={(e) => setVectorMinScore(parseFloat(e.target.value))}
                    className="w-full rounded-xl bg-slate-900 border border-white/20 px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value={0.50}>0.50 (Broad)</option>
                    <option value={0.60}>0.60 (Balanced)</option>
                    <option value={0.70}>0.70 (Strict)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={vectorLoading}
                  disabled={vectorLoading || !query.trim()}
                  icon={Sparkles}
                >
                  {vectorLoading ? 'Searching Vectors...' : 'Search Vector Space'}
                </Button>
              </div>
            </form>
          </div>

          {/* Results Section */}
          {vectorMeta && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  Matching Chunks ({vectorMeta.count} Found)
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  Model: {vectorMeta.model}
                </span>
              </div>

              {vectorResults.length === 0 ? (
                <div className="p-8 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900 text-center space-y-2">
                  <AlertCircle className="w-6 h-6 text-amber-600 mx-auto" />
                  <p className="text-xs font-bold">No matching chunks found above threshold ({vectorMinScore})</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {vectorResults.map((res, index) => (
                    <div
                      key={res.id}
                      className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3 relative overflow-hidden"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                            #{index + 1}
                          </span>
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-900">{res.documentTitle}</h4>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {res.originalFileName} • {res.department}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs">
                            Page {res.pageNumber}
                          </span>
                          <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-indigo-700 font-bold text-xs">
                            Chunk #{res.chunkIndex}
                          </span>
                          <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-black text-xs">
                            Relevance: {res.score}
                          </span>
                        </div>
                      </div>

                      <pre className="text-xs text-slate-800 font-sans whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        {res.text}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;
