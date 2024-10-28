# FourMinuteLog - Team Activity Logger

![FourMinuteLog](https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=1200&h=400&q=80)

FourMinuteLog is a modern, intuitive activity logging system designed to help teams track their daily work, challenges, and upcoming tasks efficiently.

## 🚀 Features

- **Daily Activity Tracking**
  - Log what you did
  - Track time spent on tasks
  - Record issues and solutions
  - Plan tomorrow's tasks

- **Client Management**
  - Create and manage clients
  - Custom emojis and colors
  - Quick-access tags
  - Set default clients

- **Team Collaboration**
  - View team members' activities
  - Weekly summary view
  - Time tracking analytics
  - Shared client database

- **Recurring Tasks**
  - Set up daily, weekly, or monthly tasks
  - Automatic task population
  - Flexible scheduling options
  - Time estimates

## 🛠️ Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- Supabase
- Vite
- Lucide Icons

## 🚦 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/fourminutelog.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Copy the environment template
   cp .env.example .env

   # Edit .env with your Supabase credentials
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 📝 Database Setup

1. Create a new Supabase project
2. Run the SQL scripts in the following order:
   - `setup.sql` - Creates initial tables
   - `policies.sql` - Sets up RLS policies
   - `alter.sql` - Adds recurring tasks support

## 🎯 Usage

1. **Sign Up/Sign In**
   - Create an account or sign in with existing credentials
   - Profile automatically created on first sign-in

2. **Create Activity Cards**
   - Click "New Card" to create a daily entry
   - Log tasks, issues, and plans
   - Track time spent on activities

3. **Manage Clients**
   - Add new clients with custom tags
   - Set colors and emojis
   - Assign default client for quick entry

4. **Set Up Recurring Tasks**
   - Configure tasks that repeat
   - Set frequency and schedule
   - Tasks auto-populate in daily cards

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🔒 Environment Variables

The project uses environment variables for configuration. These should never be committed to the repository.

1. Copy `.env.example` to `.env`
2. Update the values in `.env` with your actual credentials
3. Never commit `.env` to version control
4. Keep `.env.example` updated with any new variables (but no real values)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Lucide Icons](https://lucide.dev) for beautiful icons
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Supabase](https://supabase.com) for backend services
- [Vite](https://vitejs.dev) for frontend tooling

## 📞 Support

For support, email support@fourminutelog.com or join our Slack channel.