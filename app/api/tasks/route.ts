import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const listId = searchParams.get('listId');
    const section = searchParams.get('section');
    const type = searchParams.get('type');
    const completed = searchParams.get('completed') === 'true';
    
    let query = supabaseAdmin.from('tasks').select('*');
    
    if (listId) {
      query = query.eq('list_id', listId);
    }
    
    if (section) {
      query = query.eq('section', section);
    }
    
    if (type) {
      query = query.eq('type', type);
    }
    
    if (searchParams.has('completed')) {
      query = query.eq('completed', completed);
    }
    
    const { data, error } = await query;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    const tasks = data.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      listId: task.list_id,
      createdAt: task.created_at,
      priority: task.priority,
      type: task.type,
      section: task.section,
      pinned: task.pinned,
      dueDate: task.due_date
    }));
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const taskData = await req.json();
    
    if (!taskData.title || !taskData.listId || !taskData.type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const taskToInsert = {
      title: taskData.title,
      description: taskData.description || null,
      completed: taskData.completed || false,
      list_id: taskData.listId,
      priority: taskData.priority || null,
      type: taskData.type,
      section: taskData.section || null,
      pinned: taskData.pinned || false,
      due_date: taskData.dueDate || null
    };
    
    const { data: task, error } = await supabaseAdmin
      .from('tasks')
      .insert(taskToInsert)
      .select('*')
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    const transformedTask = {
      id: task.id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      listId: task.list_id,
      createdAt: task.created_at,
      priority: task.priority,
      type: task.type,
      section: task.section,
      pinned: task.pinned,
      dueDate: task.due_date
    };
    
    return NextResponse.json(transformedTask, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}