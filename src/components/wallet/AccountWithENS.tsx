import { Address } from 'viem';
import { Avatar } from '@/components/common/Avatar';
import { getSlicedAddress } from '@/utils/address';
import { Name } from '../common/Name';

type AccountWithENSProps = {
  address: Address;
};

function AccountWithENS({ address }: AccountWithENSProps) {
  return (
    <div className="inline-flex items-center justify-start gap-2">
      <Avatar address={address} />
      <div className="inline-flex flex-col items-start justify-center gap-1">
        <div className="font-inter text-sm font-medium text-primary">
          <Name address={address} />
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          {getSlicedAddress(address)}
        </div>
      </div>
    </div>
  );
}

export default AccountWithENS;