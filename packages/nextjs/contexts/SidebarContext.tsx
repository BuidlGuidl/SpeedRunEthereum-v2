"use client";

import { ReactNode, createContext, useContext, useState } from "react";

type SidebarContextType = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  hasSidebar: boolean;
  setHasSidebar: (has: boolean) => void;
};

const SidebarContext = createContext<SidebarContextType | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSidebar, setHasSidebar] = useState(false);

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen, hasSidebar, setHasSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
