"use client";
import { SessionProvider } from "next-auth/react";
import React, { PropsWithChildren } from "react";

const AuthProvider = ({ children }: PropsWithChildren) => {
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      {children}
    </SessionProvider>
  );
};

export default AuthProvider;
