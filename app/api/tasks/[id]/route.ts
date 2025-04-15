import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    const { data: task, error } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }
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
    
    return NextResponse.json(transformedTask);
  } catch (error) {
    console.error('Error fetching task:', error);
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
    const taskData = await req.json();
    
    const { data: existingTask, error: checkError } = await supabaseAdmin
      .from('tasks')
      .select('id')
      .eq('id', id)
      .single();
    
    if (checkError) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    
    const taskToUpdate = {
      title: taskData.title,
      description: taskData.description || null,
      completed: taskData.completed,
      list_id: taskData.listId,
      priority: taskData.priority || null,
      type: taskData.type,
      section: taskData.section || null,
      pinned: taskData.pinned || false,
      due_date: taskData.dueDate || null
    };
    
    const { data: updatedTask, error } = await supabaseAdmin
      .from('tasks')
      .update(taskToUpdate)
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    const transformedTask = {
      id: updatedTask.id,
      title: updatedTask.title,
      description: updatedTask.description,
      completed: updatedTask.completed,
      listId: updatedTask.list_id,
      createdAt: updatedTask.created_at,
      priority: updatedTask.priority,
      type: updatedTask.type,
      section: updatedTask.section,
      pinned: updatedTask.pinned,
      dueDate: updatedTask.due_date
    };
    
    return NextResponse.json(transformedTask);
  } catch (error) {
    console.error('Error updating task:', error);
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
    
    const { data: existingTask, error: checkError } = await supabaseAdmin
      .from('tasks')
      .select('id')
      .eq('id', id)
      .single();
    
    if (checkError) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    
    const { error } = await supabaseAdmin
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}