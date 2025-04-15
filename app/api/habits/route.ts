import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const section = searchParams.get('section');
    const archived = searchParams.get('archived') === 'true';
    
    let query = supabaseAdmin
      .from('habits')
      .select(`
        *,
        habit_check_ins (
          check_date,
          status
        )
      `);
    
    if (section) {
      query = query.eq('section', section);
    }
    
    query = query.eq('archived', archived);
    
    const { data, error } = await query;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    const habits = data.map(habit => ({
      id: habit.id,
      name: habit.name,
      section: habit.section,
      frequency: habit.frequency,
      goal: habit.goal,
      startDate: habit.start_date,
      selectedDays: habit.selected_days || [],
      checkIns: habit.habit_check_ins.map((checkIn: any) => ({
        date: checkIn.check_date,
        status: checkIn.status
      })),
      autoPopup: habit.auto_popup,
      createdAt: habit.created_at,
      archived: habit.archived
    }));
    
    return NextResponse.json(habits);
  } catch (error) {
    console.error('Error fetching habits:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const habitData = await req.json();
    
    if (!habitData.name || !habitData.section || !habitData.frequency || !habitData.goal) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const habitToInsert = {
      name: habitData.name,
      section: habitData.section,
      frequency: habitData.frequency,
      goal: habitData.goal,
      start_date: habitData.startDate || new Date().toISOString(),
      selected_days: habitData.selectedDays || [],
      auto_popup: habitData.autoPopup || false,
      archived: habitData.archived || false
    };
    
    // Insertar hábito
    const { data: habit, error } = await supabaseAdmin
      .from('habits')
      .insert(habitToInsert)
      .select('*')
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(habit, { status: 201 });
  } catch (error) {
    console.error('Error creating habit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}