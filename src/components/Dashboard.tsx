import React, { useState, useEffect } from 'react';
import { PlusCircle, Users, LayoutGrid, List, Building2, Settings, LogOut, Mail } from 'lucide-react';
import type { ActivityCard, User, Client, RecurringTask, TaskItem } from '../types/types';
import ActivityCardComponent from './ActivityCard';
import Summary from './Summary';
import ClientManager from './ClientManager';
import UserProfile from './UserProfile';
import { supabase } from '../lib/supabase';
import { LoadingSpinner } from './LoadingSpinner';
import { canDeploy, updateLastDeployTime } from '../lib/deploy';

export default function Dashboard() {
  const [cards, setCards] = useState<ActivityCard[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'summary'>('list');
  const [showClientManager, setShowClientManager] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [defaultClientId, setDefaultClientId] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<{ email: string } | null>(null);
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializeData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('No authenticated user');
      
      setAuthUser(user);

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*');
      
      if (usersError) throw usersError;
      if (usersData) setUsers(usersData);

      // Fetch clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*');
      
      if (clientsError) throw clientsError;
      if (clientsData) setClients(clientsData);

      // Get user's default client
      const { data: userPrefs } = await supabase
        .from('users')
        .select('default_client_id')
        .eq('id', user.id)
        .single();
      
      if (userPrefs?.default_client_id) {
        setDefaultClientId(userPrefs.default_client_id);
      }
      setSelectedUser(user.id);

      // Fetch recurring tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('recurring_tasks')
        .select('*')
        .eq('user_id', user.id);

      if (tasksError) throw tasksError;
      setRecurringTasks(tasksData || []);

      // Fetch cards
      const { data: cardsData, error: cardsError } = await supabase
        .from('activity_cards')
        .select('*')
        .order('date', { ascending: false });
      
      if (cardsError) throw cardsError;
      if (cardsData) setCards(cardsData);

    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'An error occurred while loading data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeData();
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const handleSaveClient = async (client: Client) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([client])
        .select()
        .single();

      if (error) throw error;
      if (data) setClients(prev => [...prev, data]);
    } catch (error) {
      console.error('Error saving client:', error);
    }
  };

  const handleUpdateClient = async (client: Client) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update(client)
        .eq('id', client.id);

      if (error) throw error;
      setClients(prev => prev.map(c => c.id === client.id ? client : c));
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) throw error;
      setClients(prev => prev.filter(c => c.id !== clientId));
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  const handleSetDefaultClient = async (clientId: string | null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('users')
        .update({ default_client_id: clientId })
        .eq('id', user.id);

      if (error) throw error;
      setDefaultClientId(clientId);
    } catch (error) {
      console.error('Error setting default client:', error);
    }
  };

  const createNewCard = async () => {
    if (!selectedUser) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const hasCardForToday = cards.some(card => 
        card.user_id === selectedUser && 
        new Date(card.date).toISOString().split('T')[0] === today
      );

      if (hasCardForToday) {
        alert('You already have a card for today');
        return;
      }

      // Refresh recurring tasks before creating card
      const { data: freshRecurringTasks, error: tasksError } = await supabase
        .from('recurring_tasks')
        .select('*')
        .eq('user_id', selectedUser);

      if (tasksError) throw tasksError;

      // Get yesterday's card for tasks_for_tomorrow
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayCard = cards.find(card => 
        card.user_id === selectedUser && 
        new Date(card.date).toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]
      );

      // Get today's recurring tasks
      const todayTasks = (freshRecurringTasks || []).filter(task => {
        const today = new Date();
        switch (task.frequency) {
          case 'daily':
            return true;
          case 'weekly':
            return task.days_of_week?.includes(today.getDay());
          case 'monthly':
            const dayOfMonth = today.getDate();
            const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
            return task.day_of_month === -1 
              ? dayOfMonth === lastDayOfMonth 
              : dayOfMonth === task.day_of_month;
          default:
            return false;
        }
      });

      const whatIDid: TaskItem[] = [
        ...todayTasks.map(task => ({
          text: task.text,
          time_estimate: task.time_estimate,
          client_id: task.client_id,
          is_recurring: true,
          recurring_task_id: task.id
        })),
        ...(yesterdayCard?.tasks_for_tomorrow?.map(task => ({
          text: task,
          client_id: defaultClientId
        })) || [])
      ];

      const newCard = {
        user_id: selectedUser,
        date: new Date().toISOString(),
        what_i_did: whatIDid,
        what_broke: [],
        how_i_fixed: [],
        tasks_for_tomorrow: [],
        last_updated: new Date().toISOString(),
        admin_time: 0,
        meeting_time: 0
      };

      const { data, error } = await supabase
        .from('activity_cards')
        .insert([newCard])
        .select()
        .single();

      if (error) throw error;
      if (data) setCards(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error creating card:', error);
    }
  };

  const handleSaveCard = async (updatedCard: ActivityCard) => {
    try {
      const { error } = await supabase
        .from('activity_cards')
        .update(updatedCard)
        .eq('id', updatedCard.id);

      if (error) throw error;
      setCards(prev => prev.map(card => 
        card.id === updatedCard.id ? updatedCard : card
      ));
    } catch (error) {
      console.error('Error updating card:', error);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!window.confirm('Are you sure you want to delete this card?')) return;

    try {
      const { error } = await supabase
        .from('activity_cards')
        .delete()
        .eq('id', cardId);

      if (error) throw error;
      setCards(prev => prev.filter(card => card.id !== cardId));
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  const handleUserUpdate = async () => {
    await initializeData();
  };

  const sortedCards = [...cards].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const currentUser = users.find(user => user.id === selectedUser);
  const defaultClient = clients.find(client => client.id === defaultClientId);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <header className="bg-white shadow-sm sticky top-0 z-10 backdrop-blur-sm bg-white/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-50 p-2 rounded-xl">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">4-Minute Log</h1>
                {authUser && (
                  <div className="flex items-center text-sm text-gray-500 mt-0.5">
                    <Mail size={12} className="mr-1" />
                    {authUser.email}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {defaultClient && (
                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-1.5">
                  <span className="text-lg">{defaultClient.emoji}</span>
                  <span className="text-sm font-medium text-gray-700">{defaultClient.tag}</span>
                </div>
              )}
              <button
                onClick={() => setShowClientManager(true)}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Manage Clients"
              >
                <Building2 size={20} />
              </button>
              <button
                onClick={() => setShowUserProfile(true)}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="User Profile"
              >
                <Settings size={20} />
              </button>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut size={20} />
              </button>
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setView('list')}
                  className={`p-2 rounded-md transition-colors ${
                    view === 'list'
                      ? 'bg-white shadow-sm text-blue-600'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <List size={18} />
                </button>
                <button
                  onClick={() => setView('summary')}
                  className={`p-2 rounded-md transition-colors ${
                    view === 'summary'
                      ? 'bg-white shadow-sm text-blue-600'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <LayoutGrid size={18} />
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <img
                  src={currentUser?.avatar}
                  alt={currentUser?.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <select
                  value={selectedUser || ''}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="select-clean"
                >
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
              <button onClick={createNewCard} className="btn-primary">
                <PlusCircle className="h-4 w-4 mr-2" />
                New Card
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'summary' ? (
          <Summary cards={sortedCards} users={users} />
        ) : (
          <div className="space-y-6">
            {sortedCards
              .filter(card => card.user_id === selectedUser)
              .map(card => (
                <ActivityCardComponent
                  key={card.id}
                  card={card}
                  onSave={handleSaveCard}
                  onDelete={handleDeleteCard}
                  currentUser={selectedUser}
                  users={users}
                  clients={clients}
                  defaultClientId={defaultClientId}
                />
              ))
            }
            {sortedCards.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No activity cards yet. Create your first card!</p>
              </div>
            )}
          </div>
        )}
      </main>

      {showClientManager && (
        <ClientManager
          isOpen={showClientManager}
          onClose={() => setShowClientManager(false)}
          clients={clients}
          onSaveClient={handleSaveClient}
          onUpdateClient={handleUpdateClient}
          onDeleteClient={handleDeleteClient}
          defaultClientId={defaultClientId}
          onSetDefaultClient={handleSetDefaultClient}
        />
      )}

      {showUserProfile && (
        <UserProfile
          isOpen={showUserProfile}
          onClose={() => setShowUserProfile(false)}
          user={currentUser}
          onUpdate={handleUserUpdate}
        />
      )}
    </div>
  );
}