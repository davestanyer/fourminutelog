import { supabase } from './supabase';
import type { Client, User, ActivityCard } from '../types/types';

export const createClient = async (clientData: Omit<Client, 'id'>): Promise<Client> => {
  // Check for duplicate tags
  const { data: existingClient } = await supabase
    .from('clients')
    .select('tag')
    .eq('tag', clientData.tag.toUpperCase())
    .single();

  if (existingClient) {
    throw new Error(`A client with tag ${clientData.tag} already exists`);
  }

  // Insert new client
  const { data, error } = await supabase
    .from('clients')
    .insert([{
      ...clientData,
      tag: clientData.tag.toUpperCase(),
      name: clientData.name.trim()
    }])
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create client');

  return data;
};

export const getClients = async (): Promise<Client[]> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
};

export const updateClient = async (client: Client): Promise<Client> => {
  const { data, error } = await supabase
    .from('clients')
    .update({
      name: client.name.trim(),
      emoji: client.emoji,
      color: client.color,
      tag: client.tag.toUpperCase()
    })
    .eq('id', client.id)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to update client');

  return data;
};

export const deleteClient = async (clientId: string): Promise<void> => {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId);

  if (error) throw error;
};

export const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('*');

  if (error) throw error;
  return data || [];
};

export const getActivityCards = async (): Promise<ActivityCard[]> => {
  const { data, error } = await supabase
    .from('activity_cards')
    .select('*')
    .order('date', { ascending: false });

  if (error) throw error;
  return data || [];
};