
// API-url, hämtas från miljövariabel eller default till localhost
const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Typ för en highscore-post
export type Score = { 
  id: number; 
  name: string; 
  points: number; 
  level: number; 
  lines: number; 
  createdAt: string 
};

// Typ för statistik
export type Stats = {
  totalScores: number;
  highestScore: number;
  averageScore: number;
};

// Typ för API-svar
export type ApiResponse<T> = {
  data?: T;
  error?: string;
  success: boolean;
};

// Hjälpfunktion för att hantera API-anrop med felhantering
async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Hämtar highscore-listan från backend
export async function fetchScores(limit = 10): Promise<Score[]> {
  try {
    return await apiCall<Score[]>(`${API}/api/scores?limit=${limit}`);
  } catch (error) {
    console.error('Failed to fetch scores:', error);
    // Returnera tom array istället för att krascha
    return [];
  }
}

// Skickar en ny poäng till backend
export async function postScore(payload: { 
  name: string; 
  points: number; 
  level: number; 
  lines: number 
}): Promise<ApiResponse<{ id: number; message: string }>> {
  try {
    const result = await apiCall<{ ok: boolean; id: number; message: string }>(`${API}/api/scores`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return { data: { id: result.id, message: result.message }, success: true };
  } catch (error) {
    console.error('Failed to post score:', error);
    return { 
      error: error instanceof Error ? error.message : 'Unknown error occurred', 
      success: false 
    };
  }
}

// Tar bort en poäng från backend
export async function deleteScore(id: number): Promise<ApiResponse<{ deleted: number; message: string }>> {
  try {
    const result = await apiCall<{ ok: boolean; deleted: number; message: string }>(`${API}/api/scores/${id}`, {
      method: 'DELETE'
    });
    return { data: { deleted: result.deleted, message: result.message }, success: true };
  } catch (error) {
    console.error('Failed to delete score:', error);
    return { 
      error: error instanceof Error ? error.message : 'Unknown error occurred', 
      success: false 
    };
  }
}

// Hämtar statistik från backend
export async function fetchStats(): Promise<Stats | null> {
  try {
    return await apiCall<Stats>(`${API}/api/stats`);
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return null;
  }
}

// Testar anslutningen till backend
export async function testConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${API}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    return data.ok === true;
  } catch (error) {
    console.error('Backend connection test failed:', error);
    return false;
  }
}

// Hjälpfunktion för att formatera datum
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}

// Hjälpfunktion för att formatera poäng
export function formatScore(score: number): string {
  return score.toLocaleString('sv-SE');
} 