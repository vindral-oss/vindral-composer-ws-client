import React, { useState, useCallback } from "react";
import {
  ComposerContext,
  type ComposerContextType,
  type ComposerState,
  type ComposerActions,
} from "./ComposerContextDefinition";

export function ComposerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ComposerState>({
    composerVersion: "",
    projectName: "",
    composerOS: "",
  });

  const actions: ComposerActions = {
    setComposerInfo: useCallback((info: Partial<ComposerState>) => {
      setState((prev) => ({ ...prev, ...info }));
    }, []),
  };

  const contextValue: ComposerContextType = {
    ...state,
    ...actions,
  };

  return (
    <ComposerContext.Provider value={contextValue}>
      {children}
    </ComposerContext.Provider>
  );
}
