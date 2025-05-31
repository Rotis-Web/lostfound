"use client";
import { createContext, useState, useContext } from "react";

type DisplayContextType = {
  view: "animale" | "obiecte";
  setView: React.Dispatch<React.SetStateAction<"animale" | "obiecte">>;
};

const DisplayContext = createContext<DisplayContextType | null>(null);

export function DisplayProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<"animale" | "obiecte">("obiecte");

  return (
    <DisplayContext.Provider value={{ view, setView }}>
      {children}
    </DisplayContext.Provider>
  );
}

export function useDisplay() {
  const context = useContext(DisplayContext);
  if (!context) {
    throw new Error("useDisplay must be used within a DisplayProvider");
  }
  return context;
}
