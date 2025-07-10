import { useState, useEffect } from 'react';
import { Tag } from '@/types/tag';

export function useTags() {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags');
      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }
      const data = await response.json();
      setAvailableTags(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tags'));
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTags = async (): Promise<Tag[]> => {
    try {
      const response = await fetch('/api/users/me/tags');
      if (!response.ok) {
        throw new Error('Failed to fetch user tags');
      }
      return await response.json();
    } catch (err) {
      console.error('Error fetching user tags:', err);
      return [];
    }
  };

  const updateUserTags = async (tagIds: string[]): Promise<boolean> => {
    try {
      const response = await fetch('/api/users/me/tags', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tagIds }),
      });
      return response.ok;
    } catch (err) {
      console.error('Error updating user tags:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  return {
    availableTags,
    loading,
    error,
    fetchUserTags,
    updateUserTags,
    refreshTags: fetchTags,
  };
}
