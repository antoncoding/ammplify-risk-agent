'use client';

import { useCallback } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ExitIcon, ExternalLinkIcon, CopyIcon } from '@radix-ui/react-icons';
import { clsx } from 'clsx';
import { useAccount, useDisconnect } from 'wagmi';
import AccountWithENS from './AccountWithENS';
import { Avatar } from '@/components/common/Avatar';
import { useStyledToast } from '@/hooks/useStyledToast';
import { getExplorerURL } from '@/utils/external';

export function AccountDropdown() {
  const { address, chainId } = useAccount();
  const { disconnect } = useDisconnect();

  const toast = useStyledToast();

  const handleDisconnectWallet = useCallback(() => {
    disconnect();
  }, [disconnect]);

  const handleCopyAddress = useCallback(() => {
    if (address) {
      void navigator.clipboard.writeText(address).then(() => {
        toast.success('Address copied', 'Address copied to clipboard');
      });
    }
  }, [address, toast]);

  if (!address) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className={clsx(
            'flex h-8 w-8 cursor-pointer items-center justify-center',
            'transition-all duration-150 ease-in-out hover:-translate-y-[2px]',
          )}
        >
          <Avatar address={address} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-card min-w-[200px] rounded-sm border-none shadow-none"
      >
        <DropdownMenuItem className="border-b border-primary/10 pb-4" disabled>
          <div className="flex w-full flex-col gap-2">
            <AccountWithENS address={address} />
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleCopyAddress}
          className="gap-4 px-4 py-2 rounded-none font-zen data-[highlighted]:bg-hovered rounded-sm"
        >
          <span className="text-sm text-primary flex-grow font-zen">Copy Address</span>
          <CopyIcon className="h-4 w-4" />
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => window.open(getExplorerURL(address, chainId ?? 1), '_blank')}
          className="gap-4 px-4 py-2 rounded-none font-zen data-[highlighted]:bg-hovered rounded-sm"
        >
          <span className="text-sm text-primary flex-grow font-zen">View on Explorer</span>
          <ExternalLinkIcon className="h-4 w-4" />
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleDisconnectWallet}
          className="gap-4 px-4 py-2 rounded-none font-zen data-[highlighted]:bg-hovered rounded-sm text-red-500 data-[highlighted]:text-red-500"
        >
          <span className="text-sm flex-grow font-zen">Log out</span>
          <ExitIcon className="h-4 w-4" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
