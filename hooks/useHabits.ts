import { useState, useEffect } from 'react';
import { Habit } from '@/lib/supabase';

export function useHabits(section?: string, archived = false) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHabits() {
      setLoading(true);
      try {
        const url = new URL('/api/habits', window.location.origin);
        if (section) {
          url.searchParams.append('section', section);
        }
        url.searchParams.append('archived', String(archived));

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch habits');
        }
        const data = await response.json();
        setHabits(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchHabits();
  }, [section, archived]);

  async function createHabit(habitData: Omit<Habit, 'id' | 'createdAt' | 'checkIns'>) {
    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(habitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create habit');
      }

      const newHabit = await response.json();
      setHabits(prevHabits => [...prevHabits, newHabit]);
      return newHabit;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    }
  }

  async function updateHabit(id: string, habitData: Partial<Habit>) {
    try {
      const response = await fetch(`/api/habits/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',  
        },
        body: JSON.stringify(habitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update habit');
      }

      const updatedHabit = await response.json();
      setHabits(prevHabits => 
        prevHabits.map(habit => 
          habit.id === id ? updatedHabit : habit
        )
      );
      return updatedHabit;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    }
  }

  async function deleteHabit(id: string) {
    try {
      const response = await fetch(`/api/habits/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete habit');
      }

      setHabits(prevHabits => prevHabits.filter(habit => habit.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    }
  }

  async function getHabitById(id: string) {
    try {
      const response = await fetch(`/api/habits/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch habit');
      }
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    }
  }

  async function addCheckIn(id: string, date: Date, status: string) {
    try {
      const habit = habits.find(h => h.id === id);
      if (!habit) {
        throw new Error('Habit not found');
      }

      const newCheckIns = [
        ...habit.checkIns,
        { date, status },
      ];

      return await updateHabit(id, {
        ...habit,
        checkIns: newCheckIns,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    }
  }

  return {
    habits,
    loading,
    error,
    createHabit,
    updateHabit,
    deleteHabit,
    getHabitById,
    addCheckIn,
  };
}