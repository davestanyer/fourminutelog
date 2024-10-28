import { supabase } from '../lib/supabase';

async function resetDatabase() {
  try {
    console.log('🗑️  Clearing existing data...');
    
    // Delete all data from tables in correct order
    await supabase.from('activity_cards').delete().neq('id', '0');
    await supabase.from('clients').delete().neq('id', '0');
    await supabase.from('users').delete().neq('id', '0');
    
    console.log('✅ Database cleared successfully');
    
    // Get current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('No authenticated user found');
    }

    // Create initial user record
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([{
        id: user.id,
        name: user.email?.split('@')[0] || 'New User',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.email || '')}`
      }])
      .select()
      .single();

    if (userError) throw userError;
    console.log('✅ User record created');

    // Create some sample clients
    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .insert([
        {
          name: 'Tech Solutions Inc',
          emoji: '💻',
          color: '#3B82F6',
          tag: 'TECH'
        },
        {
          name: 'Green Energy Co',
          emoji: '⚡',
          color: '#10B981',
          tag: 'GREEN'
        },
        {
          name: 'Digital Marketing Pro',
          emoji: '🎯',
          color: '#8B5CF6',
          tag: 'DMP'
        }
      ])
      .select();

    if (clientsError) throw clientsError;
    console.log('✅ Sample clients created');

    console.log('🎉 Database reset and initialized successfully!');
    return { user: userData, clients: clientsData };

  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  }
}

// Run the reset function
resetDatabase()
  .then(() => {
    console.log('✨ Ready to use the application!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to reset database:', error);
    process.exit(1);
  });