import { useState, useEffect } from 'react';
import { Task } from '@/lib/supabase';

export function useTasks(listId?: string, section?: string, type?: string, completed?: boolean) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTasks() {
      setLoading(true);
      try {
        const url = new URL('/api/tasks', window.location.origin);
        if (listId) {
          url.searchParams.append('listId', listId);
        }
        if (section) {
          url.searchParams.append('section', section);
        }
        if (type) {
          url.searchParams.append('type', type);
        }
        if (completed !== undefined) {
          url.searchParams.append('completed', String(completed));
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        const data = await response.json();
        setTasks(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, [listId, section, type, completed]);

  async function createTask(taskData: Omit<Task, 'id' | 'createdAt'>) {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create task');
      }

      const newTask = await response.json();
      setTasks(prevTasks => [...prevTasks, newTask]);
      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    }
  }

  async function updateTask(id: string, taskData: Partial<Task>) {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update task');
      }

      const updatedTask = await response.json();
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === id ? updatedTask : task
        )
      );
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    }
  }

  async function deleteTask(id: string) {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete task');
      }

      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    }
  }

  async function getTaskById(id: string) {
    try {
      const response = await fetch(`/api/tasks/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch task');
      }
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    }
  }

  async function toggleTaskCompletion(id: string, completed: boolean) {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) {
        throw new Error('Task not found');
      }

      return await updateTask(id, { ...task, completed });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    }
  }

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    getTaskById,
    toggleTaskCompletion,
  };
}