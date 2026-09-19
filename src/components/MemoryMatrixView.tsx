import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  Plus,
  Layers,
  Brain,
  Bookmark,
  Calendar,
  Sparkles,
  Tag,
  Key,
} from 'lucide-react';
import { MemoryRecord, MemoryType } from '../types.js';

export const MemoryMatrixView: React.FC = () => {
  const [memories, setMemories] = useState<MemoryRecord[]>([]);
  const [selectedType, setSelectedType] = useState<MemoryType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Memory Form
  const [newKey, setNewKey] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<MemoryType>('semantic');
  const [newTags, setNewTags] = useState('');

  useEffect(() => {
    fetchMemories();
  }, [selectedType, searchQuery]);

  const fetchMemories = async () => {
    try {
      let url = '/api/memory';
      const params = new URLSearchParams();
      if (selectedType !== 'all') {
        params.append('type', selectedType);
      }
      if (searchQuery.trim()) {
        params.append('query', searchQuery.trim());
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setMemories(data);
    } catch (err) {
      console.error('Failed to fetch memories:', err);
    }
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newContent.trim()) return;

    try {
      const tags = newTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch('/api/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: newKey.trim(),
          content: newContent.trim(),
          type: newType,
          tags,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewKey('');
        setNewContent('');
        setNewTags('');
        fetchMemories();
      }
    } catch (err) {
      console.error('Failed to add memory:', err);
    }
  };

  const MEMORY_TYPES: Array<{ id: MemoryType | 'all'; label: string; icon: any }> = [
    { id: 'all', label: 'All Memory Layers', icon: Database },
    { id: 'semantic', label: 'Semantic Knowledge', icon: Brain },
    { id: 'episodic', label: 'Episodic Runs', icon: Calendar },
    { id: 'working', label: 'Working Memory', icon: Layers },
    { id: 'long_term', label: 'Long-Term Principles', icon: Bookmark },
  ];

  return (
    <div id="memory-matrix-view" className="space-y-6">
      {/* Top Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-wide">Multi-Tier Memory Matrix</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Persistent episodic learning, semantic truth records, and cross-session knowledge consolidation.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search semantic memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-48 sm:w-64"
            />
          </div>

          <button
            id="btn-add-memory"
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 flex items-center space-x-1.5 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Store Fact</span>
          </button>
        </div>
      </div>

      {/* Layer Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {MEMORY_TYPES.map((t) => {
          const Icon = t.icon;
          const isSelected = selectedType === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Memory Records Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {memories.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-xs">
            No memories match the selected filter.
          </div>
        ) : (
          memories.map((mem) => (
            <div
              key={mem.id}
              className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-md space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Key className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="font-mono text-white font-bold text-xs">{mem.key}</span>
                  </div>

                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                      mem.type === 'semantic'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : mem.type === 'episodic'
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        : mem.type === 'working'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {mem.type}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                  {mem.content}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex flex-wrap gap-1">
                  {mem.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px] flex items-center space-x-1"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
                <span className="font-mono text-slate-500 text-[10px] shrink-0">
                  {new Date(mem.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Store Verified Memory Fact</h3>

            <form onSubmit={handleAddMemory} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Unique Key / Identifier</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. system_dag_rule_1"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Memory Layer</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as MemoryType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                >
                  <option value="semantic">Semantic Knowledge</option>
                  <option value="long_term">Long-Term Principle</option>
                  <option value="working">Working Memory</option>
                  <option value="episodic">Episodic Memory</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Content / Knowledge Value</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. In multi-agent DAG architectures, always run verification suites after code changes."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. architecture, best_practices, verification"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Store Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
