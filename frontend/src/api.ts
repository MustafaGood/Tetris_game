

const API = import.meta.env?.VITE_API_BASE || 'http://localhost:3001';

export type Score = { 
  _id?: string;
  id?: string | number;
  name: string; 
  points: number; 
  level: number; 
  lines: number; 
  gameDuration?: number;
  createdAt: string;
  clientIP?: string;
  userAgent?: string;
};

export type GameSeed = {
  seed: string;
  timestamp: number;
  expiresAt: number;
};

export type Stats = {
  totalScores: number;
  highestScore: number;
  averageScore: number;
};

export type ApiResponse<T> = { data?: T; error?: string; success: boolean };

export type ScoreValidation = {
  isValid: boolean;
  reason?: string;
  expectedScore?: number;
};

export type ApiResult<T> = { ok: boolean; data?: T; error?: string };

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({} as any));
      throw new Error((errorData as any).error || (errorData as any).reason || `HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

export async function fetchScores(limit = 10): Promise<Score[]> {
  try {
    const scores = await apiCall<Score[]>(`${API}/api/scores/top?limit=${limit}`);
    return scores.map(score => ({ ...score, id: score._id || score.id }));
  } catch (error) {
    console.error('Failed to fetch scores:', error);
    return [];
  }
}

export async function fetchAllScores(page = 1, limit = 20): Promise<{ scores: Score[], pagination: any }> {
  try {
    const result = await apiCall<{ page: number; size: number; total: number; items: Score[] }>(`${API}/api/scores?page=${page}&size=${limit}`);
    return { scores: result.items, pagination: { page: result.page, limit: result.size, total: result.total, pages: Math.ceil(result.total / result.size) } };
  } catch (error) {
    console.error('Failed to fetch all scores:', error);
    return { scores: [], pagination: { page, limit, total: 0, pages: 0 } };
  }
}

export async function postScore(payload: { 
  name: string; 
  points: number; 
  level: number; 
  lines: number;
  gameDuration?: number;
  gameSeed?: string;
}): Promise<ApiResponse<{ id: string; message: string; expectedScore?: number }>> {
  try {
    const result = await apiCall<{ ok: boolean; id: string; message: string; expectedScore?: number }>(`${API}/api/scores`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    if (result.ok) {
      return { data: { id: result.id, message: result.message, expectedScore: result.expectedScore }, success: true };
    }
    return { error: 'Unknown error occurred', success: false };
  } catch (error) {
    console.error('Failed to post score:', error);
    return { 
      error: error instanceof Error ? error.message : 'Unknown error occurred', 
      success: false 
    };
  }
}

export async function deleteScore(id: string): Promise<ApiResponse<{ deleted: number; message: string }>> {
  try {
    const result = await apiCall<{ ok: boolean; deleted: number; message: string }>(`${API}/api/scores/${id}`, {
      method: 'DELETE'
    });
    
    if ((result as any).ok) {
      const r = result as any;
      return { data: { deleted: r.deleted, message: r.message }, success: true };
    }
    return { error: 'Unknown error occurred', success: false };
  } catch (error) {
    console.error('Failed to delete score:', error);
    return { 
      error: error instanceof Error ? error.message : 'Unknown error occurred', 
      success: false 
    };
  }
}

export async function fetchStats(): Promise<Stats | null> {
  try {
    const result = await apiCall<{ ok: boolean; data?: Stats }>(`${API}/api/stats`);
    if (result && (result as any).ok && (result as any).data) return (result as any).data as Stats;
    return null;
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return null;
  }
}

export async function getGameSeed(): Promise<GameSeed | null> {
  try {
    const result = await apiCall<GameSeed>(`${API}/api/game/seed`);
    console.log('🎲 Received game seed:', result);
    return result;
  } catch (error) {
    console.error('Failed to get game seed:', error);
    return null;
  }
}

export async function validateScore(payload: {
  name: string;
  points: number;
  level: number;
  lines: number;
  gameDuration?: number;
  gameSeed?: string;
}): Promise<ScoreValidation> {
  try {
    const result = await apiCall<ScoreValidation>(`${API}/api/scores/validate`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return result;
  } catch (error) {
    console.error('Failed to validate score:', error);
    return { 
      isValid: false, 
      reason: error instanceof Error ? error.message : 'Validation failed' 
    };
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    console.log(`🔍 Testing connection to: ${API}/api/health`);
    console.log(`🌐 Current origin: ${window.location.origin}`);
    
    const response = await fetch(`${API}/api/health`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`📡 Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      if (response.status === 429) {
        console.log(`ℹ️ Backend rate limited (429), continuing in local mode`);
        return false;
      }
      console.warn(`⚠️ Backend responded with status: ${response.status}`);
      return false;
    }
    
    const data = await response.json();
    console.log(`✅ Backend connection successful:`, data);
    return data.ok === true;
  } catch (error) {
    console.error('❌ Backend connection test failed:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      type: error instanceof Error ? error.constructor.name : typeof error
    });
    
    if (error instanceof TypeError) {
      console.error('🔍 TypeError details - this usually indicates a network/CORS issue');
    }
    
    return false;
  }
}

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

export function formatScore(score: number): string {
  return score.toLocaleString('sv-SE');
}

export function isGameSeedExpired(seed: GameSeed): boolean {
  return Date.now() > seed.expiresAt;
}

export function getGameSeedTimeLeft(seed: GameSeed): number {
  return Math.max(0, seed.expiresAt - Date.now());
} 