import { useContext } from 'react';
import { AppContext } from './AppContext';

// Base hook - only use this when you need the full context
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

// Specialized hooks that only return specific parts of the context
export function useConnectionContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useConnectionContext must be used within an AppProvider');
  }
  
  return {
    socketUrl: context.socketUrl,
    isConnected: context.isConnected,
    urlError: context.urlError,
    setSocketUrl: context.setSocketUrl,
    setIsConnected: context.setIsConnected,
    setUrlError: context.setUrlError,
  };
}

export function useAudioContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAudioContext must be used within an AppProvider');
  }
  
  return {
    audioStrips: context.audioStrips,
    setAudioStrips: context.setAudioStrips,
    sendResetKey: context.sendResetKey,
    incrementSendResetKey: context.incrementSendResetKey,
  };
}

export function useSubscriptionContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useSubscriptionContext must be used within an AppProvider');
  }
  
  return {
    activeSubscriptions: context.activeSubscriptions,
    setActiveSubscriptions: context.setActiveSubscriptions,
  };
}

export function useMessageContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useMessageContext must be used within an AppProvider');
  }
  
  return {
    totalMessageCount: context.totalMessageCount,
    pausedIncoming: context.pausedIncoming,
    pausedOutgoing: context.pausedOutgoing,
    incrementMessageCount: context.incrementMessageCount,
    resetMessageCount: context.resetMessageCount,
    setPausedIncoming: context.setPausedIncoming,
    setPausedOutgoing: context.setPausedOutgoing,
  };
}