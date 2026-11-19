const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';

async function requestMaintenanceState() {
  const response = await fetch(`${API_BASE_URL}/maintenance-state`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

export function getMaintenanceState() {
  return requestMaintenanceState();
}
