"use client";

import { createContext, useContext } from "react";

interface FileBlockContextType {
  isInFileBlock: boolean;
}

const FileBlockContext = createContext<FileBlockContextType>({
  isInFileBlock: false,
});

export const useFileBlock = () => useContext(FileBlockContext);

export const FileBlockProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <FileBlockContext.Provider value={{ isInFileBlock: true }}>
      {children}
    </FileBlockContext.Provider>
  );
};
