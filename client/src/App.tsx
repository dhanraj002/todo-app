import React, { useEffect, useState } from 'react';
import './App.css';

type Task = {
  id: number;
  title: string;
  date: string;
  completed: number;
};

const getToday = () => new Date().toISOString().slice(0, 10);

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(getToday());
  const [view, setView] = useState<'day' | 'week' | 'month'>('day');
  const [summary, setSummary] = useState<Task[]>([]);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const fetchTasks = async () => {
    const res = await fetch(`/api/tasks?date=${date}`);
    setTasks(await res.json());
  };

  useEffect(() => {
    if (view === 'day') fetchTasks();
  }, [date, view]);

  const addTask = async () => {
    if (!title.trim()) return;
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), date })
    });
    setTitle('');
    fetchTasks();
  };

  const toggleTask = async (task: Task) => {
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...task, completed: task.completed ? 0 : 1 })
    });
    fetchTasks();
  };

  const deleteTask = async (id: number) => {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    fetchTasks();
  };

  const fetchSummary = async (type: 'week' | 'month') => {
    const now = new Date(date);
    let start, end;
    if (type === 'week') {
      const day = now.getDay();
      start = new Date(now);
      start.setDate(now.getDate() - day);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }
    const s = start.toISOString().slice(0, 10);
    const e = end.toISOString().slice(0, 10);
    const res = await fetch(`/api/summary/${type}?start=${s}&end=${e}`);
    setSummary(await res.json());
  };

  useEffect(() => {
    if (view !== 'day') fetchSummary(view);
  }, [view, date]);

  const completedTasks = view === 'day' ? tasks.filter((t: Task) => t.completed).length : summary.filter((t: Task) => t.completed).length;
  const totalTasks = view === 'day' ? tasks.length : summary.length;
  const pendingTasks = totalTasks - completedTasks;

  return (
    <div className={`min-h-screen font-inter transition-colors duration-300 ${darkMode ? 'bg-background-dark' : 'bg-background'}`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1"></div>
            <h1 className={`text-4xl md:text-5xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              ✅ Todo Master
            </h1>
            <div className="flex-1 flex justify-end">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-3 rounded-full transition-all duration-300 hover:scale-110 ${
                  darkMode 
                    ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300' 
                    : 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                }`}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Organize your daily tasks and track your progress
          </p>
        </div>
        
        {/* View Selector */}
        <div className="flex flex-wrap gap-3 justify-center mb-8 animate-slide-up">
          {[
            { key: 'day', label: '📅 Daily View', emoji: '📅' },
            { key: 'week', label: '📊 Weekly Summary', emoji: '📊' },
            { key: 'month', label: '📈 Monthly Summary', emoji: '📈' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setView(key as 'day' | 'week' | 'month')}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                view === key
                  ? 'bg-blue-500 text-white shadow-lg hover:bg-blue-600'
                  : darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-white text-gray-700 shadow-md hover:shadow-lg'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Main Content Card */}
        <div className={`rounded-2xl shadow-xl border p-8 animate-bounce-in ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          {/* Date Input */}
          <div className="mb-6 flex justify-center">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`px-4 py-3 rounded-lg border-2 font-medium transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              }`}
            />
          </div>

          {view === 'day' && (
            <>
              {/* Task Input */}
              <div className="flex gap-3 mb-8">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What do you want to accomplish today? ✨"
                  className={`flex-1 px-4 py-3 rounded-lg border-2 font-medium transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  onKeyPress={(e) => e.key === 'Enter' && addTask()}
                />
                <button
                  onClick={addTask}
                  disabled={!title.trim()}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold transition-all duration-300 hover:bg-blue-600 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md hover:shadow-lg"
                >
                  ➕ Add Task
                </button>
              </div>

              {/* Tasks List */}
              <div className="max-h-96 overflow-y-auto custom-scrollbar pr-2">
                {tasks.length === 0 ? (
                  <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div className="text-6xl mb-4 opacity-50">🎯</div>
                    <div className="text-xl font-medium mb-2">No tasks for this day</div>
                    <div className="text-sm opacity-75">Add your first task to get started!</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((task, index) => (
                      <div
                        key={task.id}
                        className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-300 hover:shadow-md animate-slide-up ${
                          task.completed
                            ? darkMode
                              ? 'bg-green-900/20 border-green-600/30'
                              : 'bg-green-50 border-green-200'
                            : darkMode
                            ? 'bg-gray-700 border-gray-600 hover:border-gray-500'
                            : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                        }`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <input
                          type="checkbox"
                          checked={!!task.completed}
                          onChange={() => toggleTask(task)}
                          className="custom-checkbox"
                        />
                        <div className="flex-1">
                          <div className={`font-medium transition-all duration-300 ${
                            task.completed
                              ? `line-through ${darkMode ? 'text-gray-400' : 'text-gray-500'}`
                              : darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {task.title}
                          </div>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            📅 {task.date}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-medium transition-all duration-300 hover:bg-red-600 hover:scale-105 shadow-sm hover:shadow-md"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {view !== 'day' && (
            <div className="space-y-8">
              {/* Summary Title */}
              <h2 className={`text-2xl font-bold text-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {view === 'week' ? '📊 Weekly Summary' : '📈 Monthly Summary'}
              </h2>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Completed', value: completedTasks, emoji: '✅', color: 'green' },
                  { label: 'Pending', value: pendingTasks, emoji: '⏳', color: 'yellow' },
                  { label: 'Total', value: totalTasks, emoji: '📝', color: 'blue' },
                  ...(totalTasks > 0 ? [{ 
                    label: 'Progress', 
                    value: `${Math.round((completedTasks / totalTasks) * 100)}%`, 
                    emoji: '🎯', 
                    color: 'purple' 
                  }] : [])
                ].map((stat, index) => (
                  <div
                    key={stat.label}
                    className={`p-4 rounded-lg text-center transition-all duration-300 hover:scale-105 animate-bounce-in ${
                      darkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-gray-50 to-gray-100'
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="text-2xl mb-1">{stat.emoji}</div>
                    <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {stat.value}
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Tasks */}
              <div className="max-h-96 overflow-y-auto custom-scrollbar pr-2">
                {summary.length === 0 ? (
                  <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div className="text-6xl mb-4 opacity-50">📊</div>
                    <div className="text-xl font-medium mb-2">No tasks for this {view}</div>
                    <div className="text-sm opacity-75">Tasks will appear here once you start adding them!</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {summary.map((task, index) => (
                      <div
                        key={task.id}
                        className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-300 animate-slide-up ${
                          task.completed
                            ? darkMode
                              ? 'bg-green-900/20 border-green-600/30'
                              : 'bg-green-50 border-green-200'
                            : darkMode
                            ? 'bg-gray-700 border-gray-600'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <input
                          type="checkbox"
                          checked={!!task.completed}
                          readOnly
                          className="custom-checkbox"
                        />
                        <div className="flex-1">
                          <div className={`font-medium ${
                            task.completed
                              ? `line-through ${darkMode ? 'text-gray-400' : 'text-gray-500'}`
                              : darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {task.title}
                          </div>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            📅 {task.date}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          task.completed
                            ? 'bg-green-500 text-white'
                            : 'bg-yellow-500 text-white'
                        }`}>
                          {task.completed ? '✅ Done' : '⏳ Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App; 