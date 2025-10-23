import { useContext } from 'react';
import { ConnectionContext } from './ConnectionContextDefinition';
import { AudioContext } from './AudioContextDefinition';
import { MessagesContext } from './MessagesContextDefinition';
import { SubscriptionsContext } from './SubscriptionsContextDefinition';
import { ComposerContext } from './ComposerContextDefinition';

export function useConnectionContext() {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error('useConnectionContext must be used within a ConnectionProvider');
  }
  return context;
}

export function useAudioContext() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudioContext must be used within an AudioProvider');
  }
  return context;
}

export function useMessagesContext() {
  const context = useContext(MessagesContext);
  if (context === undefined) {
    throw new Error('useMessagesContext must be used within a MessagesProvider');
  }
  return context;
}

export function useSubscriptionsContext() {
  const context = useContext(SubscriptionsContext);
  if (context === undefined) {
    throw new Error('useSubscriptionsContext must be used within a SubscriptionsProvider');
  }
  return context;
}

export function useComposerContext() {
  const context = useContext(ComposerContext);
  if (context === undefined) {
    throw new Error('useComposerContext must be used within a ComposerProvider');
  }
  return context;
}