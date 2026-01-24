import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial status
    NetInfo.fetch().then((state: NetInfoState) => {
      setIsOnline(state.isConnected === true && state.isInternetReachable !== false);
      setIsLoading(false);
    });

    // Subscribe to network changes
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsOnline(state.isConnected === true && state.isInternetReachable !== false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { isOnline, isLoading };
}
