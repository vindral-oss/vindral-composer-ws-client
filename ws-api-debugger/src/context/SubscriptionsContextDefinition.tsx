import { createContext } from "react";
import type { Subscription } from "../types";

// Subscriptions Context - stores active subscriptions
export interface SubscriptionsState {
  activeSubscriptions: Subscription[];
}

export interface SubscriptionsActions {
  setActiveSubscriptions: (subscriptions: Subscription[]) => void;
}

export type SubscriptionsContextType = SubscriptionsState &
  SubscriptionsActions;

export const SubscriptionsContext = createContext<
  SubscriptionsContextType | undefined
>(undefined);
