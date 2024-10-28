export interface RecurringTask {
  id: string;
  user_id: string;
  text: string;
  time_estimate?: number;
  client_id?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  days_of_week?: number[];
  day_of_month?: number;
  created_at?: string;
  updated_at?: string;
}

export interface TaskItem {
  text: string;
  time_estimate?: number;
  client_id?: string;
  is_recurring?: boolean;
  recurring_task_id?: string;
}

// ... rest of the types remain the same