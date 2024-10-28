import { supabase } from '../lib/supabase';

const DEMO_USERS = [
  { id: '1', name: 'Alex Chen', avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100' },
  { id: '2', name: 'Sarah Miller', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
  { id: '3', name: 'James Wilson', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100' },
];

const DEMO_CLIENTS = [
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
  },
  {
    name: 'Cloud Services Ltd',
    emoji: '☁️',
    color: '#06B6D4',
    tag: 'CLOUD'
  }
];

const generateDemoCards = () => {
  const cards = [];
  const users = DEMO_USERS;
  
  // Create cards for the last 7 days for each user
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    for (const user of users) {
      cards.push({
        user_id: user.id,
        date: date.toISOString(),
        last_updated: date.toISOString(),
        what_i_did: [
          { text: 'Implemented new feature', timeEstimate: 2.5, clientId: 'will_be_replaced_1' },
          { text: 'Code review for team members', timeEstimate: 1.5, clientId: 'will_be_replaced_2' },
          { text: 'Documentation update', timeEstimate: 1.0, clientId: 'will_be_replaced_1' }
        ],
        what_broke: ['API endpoint timeout', 'Database connection issue'],
        how_i_fixed: ['Implemented retry logic', 'Updated connection pool settings'],
        tasks_for_tomorrow: ['Complete feature testing', 'Start new sprint planning'],
        admin_time: 1.0,
        meeting_time: 2.0
      });
    }
  }
  
  return cards;
};

async function seedDatabase() {
  try {
    // Clear existing data
    await supabase.from('activity_cards').delete().neq('id', '0');
    await supabase.from('clients').delete().neq('id', '0');
    await supabase.from('users').delete().neq('id', '0');

    // Insert users
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .insert(DEMO_USERS)
      .select();

    if (usersError) throw usersError;
    console.log('✅ Users seeded successfully');

    // Insert clients
    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .insert(DEMO_CLIENTS)
      .select();

    if (clientsError) throw clientsError;
    console.log('✅ Clients seeded successfully');

    // Generate and insert activity cards
    const cards = generateDemoCards();
    
    // Replace placeholder client IDs with actual ones
    const updatedCards = cards.map(card => ({
      ...card,
      what_i_did: card.what_i_did.map((item: any, index: number) => ({
        ...item,
        clientId: clientsData?.[index % clientsData.length]?.id
      }))
    }));

    const { error: cardsError } = await supabase
      .from('activity_cards')
      .insert(updatedCards);

    if (cardsError) throw cardsError;
    console.log('✅ Activity cards seeded successfully');

    console.log('🎉 Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Run the seed function
seedDatabase();