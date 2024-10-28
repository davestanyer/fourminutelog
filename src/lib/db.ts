import { supabase } from './supabase';
import type { User, Client } from '../types/types';

export const getOrCreateUser = async (id: string, defaultData: Partial<User>): Promise<User> => {
  try {
    // First try to get existing user
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existingUser) {
      return existingUser as User;
    }

    // User doesn't exist, create new user
    const newUser = {
      id,
      name: defaultData.name || 'New User',
      avatar: defaultData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${id}`,
      default_client_id: null
    };

    const { data: createdUser, error: createError } = await supabase
      .from('users')
      .insert([newUser])
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    return createdUser as User;
  } catch (error) {
    console.error('Error in getOrCreateUser:', error);
    throw error;
  }
};

export const createClient = async (clientData: Omit<Client, 'id'>): Promise<Client> => {
  try {
    // Check for duplicate tags
    const { data: existingClient, error: checkError } = await supabase
      .from('clients')
      .select('tag')
      .eq('tag', clientData.tag.toUpperCase())
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingClient) {
      throw new Error(`A client with tag ${clientData.tag} already exists`);
    }

    // Insert new client
    const { data, error: createError } = await supabase
      .from('clients')
      .insert([{
        ...clientData,
        tag: clientData.tag.toUpperCase(),
        name: clientData.name.trim()
      }])
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    if (!data) {
      throw new Error('Failed to create client');
    }

    return data as Client;
  } catch (error) {
    console.error('Error in createClient:', error);
    throw error;
  }
};

export const getClients = async (): Promise<Client[]> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name');

    if (error) {
      throw error;
    }

    return data as Client[];
  } catch (error) {
    console.error('Error in getClients:', error);
    throw error;
  }
};

export const updateClient = async (client: Client): Promise<Client> => {
  try {
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

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error('Failed to update client');
    }

    return data as Client;
  } catch (error) {
    console.error('Error in updateClient:', error);
    throw error;
  }
};

export const deleteClient = async (clientId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteClient:', error);
    throw error;
  }
};

export const updateDefaultClientId = async (userId: string, clientId: string | null): Promise<void> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ default_client_id: clientId })
      .eq('id', userId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error in updateDefaultClientId:', error);
    throw error;
  }
};