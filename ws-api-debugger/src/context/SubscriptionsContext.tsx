import React, { useState, useCallback } from "react";
import {
  SubscriptionsContext,
  type SubscriptionsContextType,
  type SubscriptionsState,
  type SubscriptionsActions,
} from "./SubscriptionsContextDefinition";
import type { Subscription } from "../types";

export function SubscriptionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<SubscriptionsState>({
    activeSubscriptions: [],
  });

  const actions: SubscriptionsActions = {
    setActiveSubscriptions: useCallback((subscriptions: Subscription[]) => {
      setState((prev) => ({ ...prev, activeSubscriptions: subscriptions }));
    }, []),
  };

  const contextValue: SubscriptionsContextType = {
    ...state,
    ...actions,
  };

  return (
    <SubscriptionsContext.Provider value={contextValue}>
      {children}
    </SubscriptionsContext.Provider>
  );
}
