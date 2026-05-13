import { useEffect } from 'react';
import { wsManager } from '@/services/websocket';

export function useWebSocket() {
  useEffect(() => {
    wsManager.connect();
    return () => wsManager.disconnect();
  }, []);

  return { on: wsManager.on.bind(wsManager) };
}
