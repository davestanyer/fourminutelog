import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { ActivityCard, User, Client } from '../types/types';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*');

        if (error) throw error;
        setUsers(data || []);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  return { users, loading, error };
}

export function useActivityCards(userId: string) {
  const [cards, setCards] = useState<ActivityCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchCards() {
      try {
        const { data, error } = await supabase
          .from('activity_cards')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false });

        if (error) throw error;

        // Transform the data to match our frontend types
        const transformedCards = (data || []).map(card => ({
          id: card.id,
          userId: card.user_id,
          date: card.date,
          lastUpdated: card.last_updated,
          whatIDid: card.what_i_did as any[],
          whatBroke: card.what_broke,
          howIFixed: card.how_i_fixed,
          tasksForTomorrow: card.tasks_for_tomorrow,
          adminTime: card.admin_time,
          meetingTime: card.meeting_time
        }));

        setCards(transformedCards);
      } catch (err) {
        console.error('Error fetching cards:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchCards();
  }, [userId]);

  const createCard = async (card: Omit<ActivityCard, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('activity_cards')
        .insert([{
          user_id: card.userId,
          date: card.date,
          last_updated: card.lastUpdated,
          what_i_did: card.whatIDid,
          what_broke: card.whatBroke,
          how_i_fixed: card.howIFixed,
          tasks_for_tomorrow: card.tasksForTomorrow,
          admin_time: card.adminTime,
          meeting_time: card.meetingTime
        }])
        .select()
        .single();

      if (error) throw error;

      const transformedCard: ActivityCard = {
        id: data.id,
        userId: data.user_id,
        date: data.date,
        lastUpdated: data.last_updated,
        whatIDid: data.what_i_did,
        whatBroke: data.what_broke,
        howIFixed: data.how_i_fixed,
        tasksForTomorrow: data.tasks_for_tomorrow,
        adminTime: data.admin_time,
        meetingTime: data.meeting_time
      };

      setCards(prev => [transformedCard, ...prev]);
      return transformedCard;
    } catch (err) {
      console.error('Error creating card:', err);
      throw err;
    }
  };

  const updateCard = async (card: ActivityCard) => {
    try {
      const { error } = await supabase
        .from('activity_cards')
        .update({
          user_id: card.userId,
          date: card.date,
          last_updated: card.lastUpdated,
          what_i_did: card.whatIDid,
          what_broke: card.whatBroke,
          how_i_fixed: card.howIFixed,
          tasks_for_tomorrow: card.tasksForTomorrow,
          admin_time: card.adminTime,
          meeting_time: card.meetingTime
        })
        .eq('id', card.id);

      if (error) throw error;
      setCards(prev => prev.map(c => c.id === card.id ? card : c));
    } catch (err) {
      console.error('Error updating card:', err);
      throw err;
    }
  };

  const deleteCard = async (cardId: string) => {
    try {
      const { error } = await supabase
        .from('activity_cards')
        .delete()
        .eq('id', cardId);

      if (error) throw error;
      setCards(prev => prev.filter(c => c.id !== cardId));
    } catch (err) {
      console.error('Error deleting card:', err);
      throw err;
    }
  };

  return { cards, loading, error, createCard, updateCard, deleteCard };
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchClients() {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('name');

        if (error) throw error;
        setClients(data || []);
      } catch (err) {
        console.error('Error fetching clients:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchClients();
  }, []);

  const createClient = async (client: Omit<Client, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([client])
        .select()
        .single();

      if (error) throw error;
      setClients(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Error creating client:', err);
      throw err;
    }
  };

  const updateClient = async (client: Client) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update(client)
        .eq('id', client.id);

      if (error) throw error;
      setClients(prev => prev.map(c => c.id === client.id ? client : c));
    } catch (err) {
      console.error('Error updating client:', err);
      throw err;
    }
  };

  const deleteClient = async (clientId: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) throw error;
      setClients(prev => prev.filter(c => c.id !== clientId));
    } catch (err) {
      console.error('Error deleting client:', err);
      throw err;
    }
  };

  return { clients, loading, error, createClient, updateClient, deleteClient };
}