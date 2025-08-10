'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Home, Search } from 'lucide-react';
import { Button } from '@/components/common/Button';
import Header from '@/components/layout/header/Header';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-zen">
      <Header ghost />
      
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md mx-auto text-center">
          {/* Large 404 */}
          <div className="mb-8">
            <h1 className="text-8xl font-bold text-primary/20 font-zen">
              404
            </h1>
            <div className="mt-2 h-1 w-16 bg-primary mx-auto rounded"></div>
          </div>
          
          {/* Error Message */}
          <div className="mb-8">
            <h2 className="text-2xl font-zen font-medium text-foreground mb-4">
              Page Not Found
            </h2>
            <p className="text-muted-foreground font-inter leading-relaxed">
              The page you're looking for doesn't exist or has been moved. 
              Let's get you back to analyzing liquidity pools.
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="inline-block">
              <Button 
                variant="secondary" 
                className="w-full sm:w-auto px-6 py-3 font-zen"
                size="lg"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </Link>
            
            <Link href="/analysis" className="inline-block">
              <Button 
                variant="cta" 
                className="w-full sm:w-auto px-6 py-3 font-zen"
                size="lg"
              >
                <Search className="w-4 h-4 mr-2" />
                Analyze Pools
              </Button>
            </Link>
          </div>
          
          {/* Go Back Link */}
          <div className="mt-8">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors font-inter"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Go back to previous page
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}