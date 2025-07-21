'use client';

import React from 'react';
import Header from '@/components/layout/header/Header';

export default function Content() {
  return (
    <div className="flex flex-col min-h-screen bg-main font-zen">
      <Header ghost />
      {/* Price Chart Section */}
      <section className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl h-80 bg-accent rounded-lg flex items-center justify-center text-2xl text-accent-foreground shadow-md">
          Price Chart Placeholder
        </div>
      </section>
      {/* Chat Section */}
      <section className="w-full max-w-4xl mx-auto p-6 pb-10">
        <div className="h-72 bg-card rounded-lg shadow-md flex flex-col">
          <div className="flex-1 p-4 overflow-y-auto">Chat messages will appear here.</div>
          <form className="flex border-t border-border">
            <input
              type="text"
              className="flex-1 p-3 bg-transparent outline-none text-base"
              placeholder="Type your message..."
              disabled
            />
            <button type="submit" className="px-6 py-3 text-primary font-semibold" disabled>
              Send
            </button>
          </form>
        </div>
      </section>
    </div>
  );
} 