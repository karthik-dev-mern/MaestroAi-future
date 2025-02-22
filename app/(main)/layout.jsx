"use client";

import React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/header";
import Chat from "@/components/chatbot/chat";

const MainLayout = ({ children }) => {
  return (
    <ClerkProvider>
      <div className="relative min-h-screen">
        <Header />
        <main>
          <div className="container mx-auto mt-24 mb-20">{children}</div>
        </main>
        <Chat />
      </div>
    </ClerkProvider>
  );
};

export default MainLayout;
