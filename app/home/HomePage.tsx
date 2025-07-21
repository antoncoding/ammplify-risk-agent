'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/common/Button';
import Header from '@/components/layout/header/Header';

export default function HomePage() {
  return (
    <div className="bg-main flex min-h-screen flex-col">
      <Header ghost />
      <main className="container mx-auto flex flex-1 flex-col items-center justify-center">
        <section className="flex w-full flex-col items-center justify-center">
          <div className="h-48 w-full sm:h-44 sm:w-4/5 md:w-3/5">
            <h2 className="mb-2 flex flex-col gap-6 px-4 text-center font-zen text-3xl leading-tight text-secondary sm:mb-10 sm:text-4xl md:text-5xl">
              <div className="flex items-center justify-center">
                <span className="text-primary">Ammplify Risk Agent</span>
              </div>
              <div className="flex items-center justify-center text-2xl">
                <span>(Smart) Ape with AI</span>
              </div>
            </h2>
          </div>
          <div className="mt-8 flex w-full justify-center gap-4 px-4 sm:w-auto sm:flex-row">
            <Link href="/demo" className="block w-full sm:w-auto">
              <Button variant="cta" className="w-full px-10 py-4 font-zen" size="lg">
                Get Started
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
