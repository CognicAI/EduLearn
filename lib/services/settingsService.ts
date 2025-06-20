import { ProfileData, NotificationSettings, SystemSettings, Session, ActivityLog } from '@/lib/types/settings';
import { authService } from '@/lib/auth/auth-service';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getAuthHeaders = () => {
  const token = authService.getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export async function fetchUserProfile(): Promise<ProfileData> {
  const res = await fetch(`${API_URL}/user/profile`, { headers: getAuthHeaders() });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}

export async function updateUserProfile(data: ProfileData): Promise<void> {
  const res = await fetch(`${API_URL}/user/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
}

export async function fetchUserSettings(): Promise<NotificationSettings> {
  const res = await fetch(`${API_URL}/user/settings`, { headers: getAuthHeaders() });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}

export async function updateUserSettings(data: NotificationSettings): Promise<void> {
  const res = await fetch(`${API_URL}/user/settings`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
}

export async function fetchUserSessions(): Promise<Session[]> {
  const res = await fetch(`${API_URL}/user/sessions`, { headers: getAuthHeaders() });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}

export async function fetchUserActivity(): Promise<ActivityLog[]> {
  const res = await fetch(`${API_URL}/user/activity`, { headers: getAuthHeaders() });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}
