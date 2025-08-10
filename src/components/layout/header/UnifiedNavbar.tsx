'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDownIcon, Cross1Icon, HamburgerMenuIcon } from '@radix-ui/react-icons';
import { clsx } from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { FaRegMoon } from 'react-icons/fa';
import { FiSettings } from 'react-icons/fi';
import { LuSunMedium } from 'react-icons/lu';
import { RiBookLine, RiDiscordFill, RiGithubFill } from 'react-icons/ri';
import AccountConnect from '@/components/wallet/AccountConnect';

import logo from '../../../../public/icon.png';

function NavbarLink({
  children,
  href,
  matchKey,
  target,
}: {
  children: React.ReactNode;
  href: string;
  matchKey?: string;
  target?: string;
}) {
  const pathname = usePathname();
  const isActive = matchKey ? pathname.includes(matchKey) : pathname === href;

  return (
    <Link
      href={href}
      className={clsx(
        'px-2 py-1 text-center font-zen text-base font-normal text-primary no-underline',
        'relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-full after:bg-primary',
        'no-underline transition-all duration-200',
        isActive ? 'after:opacity-100' : 'after:opacity-0',
      )}
      target={target}
    >
      {children}
    </Link>
  );
}

function NavbarTitle() {
  return (
    <div className="flex h-8 items-center justify-start gap-4">
      <Image src={logo} alt="logo" height={30} />
      <Link
        href="/"
        passHref
        className="text-center font-zen text-lg font-medium text-primary no-underline"
        aria-label="Ammplify Risk Agent"
      >
        Ammplify Risk Agent
      </Link>
    </div>
  );
}

export default function UnifiedNavbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toggleMobileMenuOpen = useCallback(() => setMobileMenuOpen((open) => !open), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Responsive: mobile menu if open, else desktop/mobile collapsed
  return (
    <>
      {/* Mobile menu open */}
      {isMobileMenuOpen ? (
        <nav className="sm:max-h-100 bg-card flex flex-col gap-4 rounded p-2 backdrop-blur-2xl md:hidden">
          <div className="flex flex-1 flex-grow items-center justify-between rounded bg-card p-4 backdrop-blur-2xl mx-4">
            <div className="flex grow items-center justify-between gap-4">
              <NavbarTitle />
              <button
                type="button"
                aria-label="Menu"
                data-state="open"
                onClick={toggleMobileMenuOpen}
              >
                <Cross1Icon width="24" height="24" />
              </button>
            </div>
          </div>
          <div>
            <ul className="mx-2 flex flex-col gap-4">
              <li className="flex">
                <NavbarLink href="/" matchKey="/">
                  <p className="text-base opacity-80 hover:opacity-100">Home</p>
                </NavbarLink>
              </li>
              <li className="flex">
                <NavbarLink href="/demo" matchKey="/demo">
                  <p className="text-base opacity-80 hover:opacity-100">Demo</p>
                </NavbarLink>
              </li>
              <li className="flex">
                <NavbarLink href="/docs" matchKey="/docs">
                  <p className="text-base opacity-80 hover:opacity-100">Documentation</p>
                </NavbarLink>
              </li>
              <li className="flex">
                <DropdownMenu open={isMoreOpen} onOpenChange={setIsMoreOpen}>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className={clsx(
                        'px-2 py-1 text-center font-zen text-base font-normal text-primary',
                        'border-none transition-all duration-200',
                        'inline-flex items-center gap-1',
                        'focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0',
                        'active:outline-none active:ring-0',
                        'bg-transparent hover:bg-transparent active:bg-transparent',
                        '[&:not(:focus-visible)]:outline-none',
                      )}
                    >
                      More
                      <ChevronDownIcon
                        className={clsx(
                          'h-4 w-4 transition-transform duration-200 ease-in-out',
                          isMoreOpen && 'rotate-180',
                        )}
                      />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card min-w-[180px] rounded-sm border-none shadow-none" avoidCollisions={true} sideOffset={8}>
                    <DropdownMenuItem
                      onClick={() => window.open('https://github.com/', '_blank')}
                      className="gap-4 px-4 py-2 rounded-none font-zen data-[highlighted]:bg-hovered rounded-sm"
                    >
                      <span className="text-sm text-primary flex-grow font-zen">Docs</span>
                      <RiBookLine className="h-4 w-4" />
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => window.open('https://discord.gg/', '_blank')}
                      className="gap-4 px-4 py-2 rounded-none font-zen data-[highlighted]:bg-hovered rounded-sm"
                    >
                      <span className="text-sm text-primary flex-grow font-zen">Discord</span>
                      <RiDiscordFill className="h-4 w-4" />
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => window.open('https://github.com/', '_blank')}
                      className="gap-4 px-4 py-2 rounded-none font-zen data-[highlighted]:bg-hovered rounded-sm"
                    >
                      <span className="text-sm text-primary flex-grow font-zen">GitHub</span>
                      <RiGithubFill className="h-4 w-4" />
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={toggleTheme}
                      className="gap-4 px-4 py-2 rounded-none font-zen data-[highlighted]:bg-hovered rounded-sm"
                    >
                      <span className="text-sm text-primary flex-grow font-zen">
                        {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
                      </span>
                      {mounted && (theme === 'dark' ? <LuSunMedium size={16} /> : <FaRegMoon size={14} />)}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-4 px-4 py-2 rounded-none font-zen data-[highlighted]:bg-hovered rounded-sm">
                      <Link href="/settings" className="text-sm text-primary no-underline flex-grow">
                        Settings
                      </Link>
                      <FiSettings className="h-4 w-4" />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            </ul>
            <div className="mx-2 mt-4">
              <AccountConnect />
            </div>
          </div>
        </nav>
      ) : (
        // Desktop or mobile collapsed
        <nav className="bg-card flex h-full w-full items-center justify-between rounded px-4">
          <NavbarTitle />
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <NavbarLink href="/">Home</NavbarLink>
              <DropdownMenu open={isMoreOpen} onOpenChange={setIsMoreOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={clsx(
                      'px-2 py-1 text-center font-zen text-base font-normal text-primary',
                      'border-none transition-all duration-200',
                      'inline-flex items-center gap-1',
                      'focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0',
                      'active:outline-none active:ring-0',
                      'bg-transparent hover:bg-transparent active:bg-transparent',
                      '[&:not(:focus-visible)]:outline-none',
                    )}
                  >
                    More
                    <ChevronDownIcon
                      className={clsx(
                        'h-4 w-4 transition-transform duration-200 ease-in-out',
                        isMoreOpen && 'rotate-180',
                      )}
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card min-w-[180px] rounded-sm border-none shadow-none" avoidCollisions={true} sideOffset={8}>
                  <DropdownMenuItem
                    onClick={() => window.open('https://github.com/', '_blank')}
                    className="gap-4 px-4 py-2 rounded-none font-zen data-[highlighted]:bg-hovered rounded-sm"
                  >
                    <span className="text-sm text-primary flex-grow font-zen">Docs</span>
                    <RiBookLine className="h-4 w-4" />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => window.open('https://discord.gg/', '_blank')}
                    className="gap-4 px-4 py-2 rounded-none font-zen data-[highlighted]:bg-hovered rounded-sm"
                  >
                    <span className="text-sm text-primary flex-grow font-zen">Discord</span>
                    <RiDiscordFill className="h-4 w-4" />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => window.open('https://github.com/', '_blank')}
                    className="gap-4 px-4 py-2 rounded-none font-zen data-[highlighted]:bg-hovered rounded-sm"
                  >
                    <span className="text-sm text-primary flex-grow font-zen">GitHub</span>
                    <RiGithubFill className="h-4 w-4" />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={toggleTheme}
                    className="gap-4 px-4 py-2 rounded-none font-zen data-[highlighted]:bg-hovered rounded-sm"
                  >
                    <span className="text-sm text-primary flex-grow font-zen">
                      {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
                    </span>
                    {mounted && (theme === 'dark' ? <LuSunMedium size={16} /> : <FaRegMoon size={14} />)}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-4 px-4 py-2 rounded-none font-zen data-[highlighted]:bg-hovered rounded-sm">
                    <Link href="/settings" className="text-sm text-primary no-underline flex-grow">
                      Settings
                    </Link>
                    <FiSettings className="h-4 w-4" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-6">
              <AccountConnect />
            </div>
            {/* Hamburger for mobile only */}
            <button
              type="button"
              aria-label="Menu"
              data-state="closed"
              onClick={toggleMobileMenuOpen}
              className="md:hidden ml-2"
            >
              <HamburgerMenuIcon width="24" height="24" />
            </button>
          </div>
        </nav>
      )}
    </>
  );
} 