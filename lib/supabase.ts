import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export type Habit = {
  id: string;
  name: string;
  section: string;
  frequency: string;
  goal: string;
  startDate: Date;
  selectedDays?: number[];
  checkIns: HabitCheckIn[];
  autoPopup: boolean;
  createdAt: Date;
  archived: boolean;
};

export type HabitCheckIn = {
  date: Date;
  status: string;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  listId: string;
  createdAt: Date;
  priority?: string;
  type: string;
  section?: string;
  pinned?: boolean;
  dueDate?: Date;
};