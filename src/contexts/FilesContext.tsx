import { createContext, useContext, type ReactNode } from "react";

interface FilesContextType {
  refetchFiles: () => void;
}

const FilesContext = createContext<FilesContextType | null>(null);

interface FilesProviderProps {
  children: ReactNode;
  refetchFiles: () => void;
}

export function FilesProvider({ children, refetchFiles }: FilesProviderProps) {
  return (
    <FilesContext.Provider value={{ refetchFiles }}>
      {children}
    </FilesContext.Provider>
  );
}

export function useFilesContext() {
  const context = useContext(FilesContext);
  if (!context) {
    throw new Error("useFilesContext must be used within a FilesProvider");
  }
  return context;
}
