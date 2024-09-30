import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

function SessionManagement() {
  const { activeSessions, logoutDevice, deviceId, fetchActiveSessions } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSessions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await fetchActiveSessions();
      } catch (err) {
        console.error('Failed to fetch active sessions:', err);
        setError('Failed to load active sessions. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();
  }, [fetchActiveSessions]);

  const handleLogout = async (sessionDeviceId) => {
    try {
      await logoutDevice(sessionDeviceId);
      // Refresh the sessions list after successful logout
      await fetchActiveSessions();
    } catch (err) {
      console.error('Failed to logout device:', err);
      setError('Failed to logout device. Please try again.');
    }
  };

  if (isLoading) {
    return <div>Loading sessions...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Active Sessions</h2>
      {activeSessions.length === 0 ? (
        <p>No active sessions found.</p>
      ) : (
        <ul>
          {activeSessions.map(session => (
            <li key={session.deviceId} className="mb-2 p-2 border rounded">
              Device ID: {session.deviceId}
              {session.deviceId === deviceId ? ' (This device)' : ''}
              <button 
                onClick={() => handleLogout(session.deviceId)}
                className="ml-4 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SessionManagement;