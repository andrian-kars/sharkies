import { FC, ReactNode } from "react";

type MainProps = {
  children: ReactNode;
};

export const Main: FC<MainProps> = ({ children }) => (
  <main id="main-content" tabIndex={-1}>
    {children}
  </main>
);
