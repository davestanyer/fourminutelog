import React, { useState } from 'react';
import { Plus, X, Calendar, Clock } from 'lucide-react';
import type { RecurringTask, Client } from '../types/types';
import { supabase } from '../lib/supabase';

interface Props {
  userId: string;
  clients: Client[];
  defaultClientId?: string | null;
  onClose: () => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export default function RecurringTasks({ userId, clients, defaultClientId, onClose }: Props) {
  const [tasks, setTasks] = useState<RecurringTask[]>([]);
  const [newTask, setNewTask] = useState({
    text: '',
    time_estimate: 0,
    client_id: defaultClientId || undefined,
    frequency: 'daily' as const,
    days_of_week: [],
    day_of_month: 1
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    loadTasks();
  }, [userId]);

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('recurring_tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error('Error loading recurring tasks:', err);
      setError('Failed to load recurring tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const taskData = {
        user_id: userId,
        ...newTask,
        days_of_week: newTask.frequency === 'weekly' ? newTask.days_of_week : null,
        day_of_month: newTask.frequency === 'monthly' ? newTask.day_of_month : null
      };

      const { data, error } = await supabase
        .from('recurring_tasks')
        .insert([taskData])
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => [data, ...prev]);
      setNewTask({
        text: '',
        time_estimate: 0,
        client_id: defaultClientId || undefined,
        frequency: 'daily',
        days_of_week: [],
        day_of_month: 1
      });
    } catch (err) {
      console.error('Error creating recurring task:', err);
      setError('Failed to create recurring task');
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('recurring_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (err) {
      console.error('Error deleting recurring task:', err);
      setError('Failed to delete recurring task');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Recurring Task</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Description
            </label>
            <input
              type="text"
              value={newTask.text}
              onChange={(e) => setNewTask(prev => ({ ...prev, text: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter task description"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Estimate (hours)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={newTask.time_estimate}
                onChange={(e) => setNewTask(prev => ({ ...prev, time_estimate: parseFloat(e.target.value) || 0 }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client
              </label>
              <select
                value={newTask.client_id || ''}
                onChange={(e) => setNewTask(prev => ({ ...prev, client_id: e.target.value || undefined }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">No client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.emoji} {client.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frequency
            </label>
            <select
              value={newTask.frequency}
              onChange={(e) => setNewTask(prev => ({ 
                ...prev, 
                frequency: e.target.value as 'daily' | 'weekly' | 'monthly'
              }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {newTask.frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Days of Week
              </label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map(day => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => {
                      setNewTask(prev => ({
                        ...prev,
                        days_of_week: prev.days_of_week.includes(day.value)
                          ? prev.days_of_week.filter(d => d !== day.value)
                          : [...prev.days_of_week, day.value]
                      }));
                    }}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      newTask.days_of_week.includes(day.value)
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {newTask.frequency === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Day of Month
              </label>
              <select
                value={newTask.day_of_month}
                onChange={(e) => setNewTask(prev => ({ 
                  ...prev, 
                  day_of_month: parseInt(e.target.value) 
                }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={-1}>Last day of month</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Add Recurring Task
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Recurring Tasks</h3>
        
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : tasks.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No recurring tasks yet</p>
        ) : (
          <div className="space-y-4">
            {tasks.map(task => {
              const client = clients.find(c => c.id === task.client_id);
              
              return (
                <div
                  key={task.id}
                  className="flex items-start justify-between p-4 bg-gray-50 rounded-lg group"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-900">{task.text}</span>
                      {task.time_estimate && (
                        <span className="text-sm text-gray-500">
                          ({task.time_estimate}h)
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3 mt-2 text-sm">
                      {client && (
                        <span
                          className="inline-flex items-center space-x-1 px-2 py-1 rounded"
                          style={{
                            backgroundColor: `${client.color}15`,
                            color: client.color
                          }}
                        >
                          <span>{client.emoji}</span>
                          <span>{client.tag}</span>
                        </span>
                      )}
                      
                      <span className="flex items-center text-gray-500">
                        <Calendar size={14} className="mr-1" />
                        {task.frequency === 'daily' && 'Daily'}
                        {task.frequency === 'weekly' && (
                          <>Weekly on {task.days_of_week?.map(d => DAYS_OF_WEEK[d].label).join(', ')}</>
                        )}
                        {task.frequency === 'monthly' && (
                          <>Monthly on {task.day_of_month === -1 ? 'last day' : `day ${task.day_of_month}`}</>
                        )}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}