import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    const { data: habit, error } = await supabaseAdmin
      .from('habits')
      .select(`
        *,
        habit_check_ins (
          check_date,
          status
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    const transformedHabit = {
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
    };
    
    return NextResponse.json(transformedHabit);
  } catch (error) {
    console.error('Error fetching habit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const habitData = await req.json();
    
    const { data: existingHabit, error: checkError } = await supabaseAdmin
      .from('habits')
      .select('id')
      .eq('id', id)
      .single();
    
    if (checkError) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }
    
    const habitToUpdate = {
      name: habitData.name,
      section: habitData.section,
      frequency: habitData.frequency,
      goal: habitData.goal,
      start_date: habitData.startDate,
      selected_days: habitData.selectedDays || [],
      auto_popup: habitData.autoPopup,
      archived: habitData.archived
    };
    
    const { data: updatedHabit, error } = await supabaseAdmin
      .from('habits')
      .update(habitToUpdate)
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (habitData.checkIns && habitData.checkIns.length > 0) {
      await supabaseAdmin
        .from('habit_check_ins')
        .delete()
        .eq('habit_id', id);
      
      const checkInsToInsert = habitData.checkIns.map((checkIn: any) => ({
        habit_id: id,
        check_date: checkIn.date,
        status: checkIn.status
      }));
      
      await supabaseAdmin
        .from('habit_check_ins')
        .insert(checkInsToInsert);
    }
    
    const { data: habitWithCheckIns } = await supabaseAdmin
      .from('habits')
      .select(`
        *,
        habit_check_ins (
          check_date,
          status
        )
      `)
      .eq('id', id)
      .single();
    
    return NextResponse.json(habitWithCheckIns);
  } catch (error) {
    console.error('Error updating habit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    const { data: existingHabit, error: checkError } = await supabaseAdmin
      .from('habits')
      .select('id')
      .eq('id', id)
      .single();
    
    if (checkError) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }
    
    const { error } = await supabaseAdmin
      .from('habits')
      .delete()
      .eq('id', id);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    console.error('Error deleting habit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}