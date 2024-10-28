import { supabase } from './supabase';
import { ActivityCard, Client, User } from '../types/types';

export const fetchCards = async () => {
  const { data, error } = await supabase
    .from('activity_cards')
    .select('*')
    .order('date', { ascending: false });
  
  if (error) throw error;
  return data as ActivityCard[];
};

export const createCard = async (card: Omit<ActivityCard, 'id'>) => {
  const { data, error } = await supabase
    .from('activity_cards')
    .insert([card])
    .select()
    .single();
  
  if (error) throw error;
  return data as ActivityCard;
};

export const updateCard = async (card: ActivityCard) => {
  const { data, error } = await supabase
    .from('activity_cards')
    .update(card)
    .eq('id', card.id)
    .select()
    .single();
  
  if (error) throw error;
  return data as ActivityCard;
};

export const deleteCard = async (cardId: string) => {
  const { error } = await supabase
    .from('activity_cards')
    .delete()
    .eq('id', cardId);
  
  if (error) throw error;
};

export const fetchUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*');
  
  if (error) throw error;
  return data as User[];
};

export const updateUser = async (user: User) => {
  const { data, error } = await supabase
    .from('users')
    .update(user)
    .eq('id', user.id)
    .select()
    .single();
  
  if (error) throw error;
  return data as User;
};

export const fetchClients = async () => {
  const { data, error } = await supabase
    .from('clients')
    .select('*');
  
  if (error) throw error;
  return data as Client[];
};

export const createClient = async (client: Omit<Client, 'id'>) => {
  const { data, error } = await supabase
    .from('clients')
    .insert([client])
    .select()
    .single();
  
  if (error) throw error;
  return data as Client;
};

export const updateClient = async (client: Client) => {
  const { data, error } = await supabase
    .from('clients')
    .update(client)
    .eq('id', client.id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Client;
};

export const deleteClient = async (clientId: string) => {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId);
  
  if (error) throw error;
};

export const updateDefaultClientId = async (userId: string, clientId: string | null) => {
  const { error } = await supabase
    .from('users')
    .update({ default_client_id: clientId })
    .eq('id', userId);
  
  if (error) throw error;
};