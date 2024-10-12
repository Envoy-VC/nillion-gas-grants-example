import React, { useState } from 'react';

import { useNillion } from '~/lib/hooks';
import { errorHandler } from '~/lib/utils';

import { isNumber } from '@nillion/client-core';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';

import { Loader2 } from 'lucide-react';

export const GrantForm = () => {
  const [grantee, setGrantee] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  const [allowanceData, setAllowanceData] = useState<object | null>(null);

  const { approveFeeGrant, getCurrentAllowance } = useNillion();

  const { mutateAsync, isPending } = useMutation({
    throwOnError: false,
    mutationFn: async () => {
      if (!isNumber(Number(amount))) {
        throw new Error('Invalid amount');
      }
      if (Number(amount) <= 0) {
        throw new Error('Amount must be greater than 0');
      }
      const amt = BigInt(Number(amount) * 10 ** 6);

      // TODO: Validate Nillion Address
      const hash = await approveFeeGrant(grantee, amt);
      return hash;
    },
    onError: (err: unknown) => {
      toast.error(errorHandler(err));
    },
    onSuccess: (hash: string) => {
      toast.success(`Fee Grant approved: ${hash}`);
    },
  });

  return (
    <div className='flex flex-col gap-3 py-6'>
      <Input
        placeholder='Grantee Address'
        value={grantee}
        onChange={(e) => setGrantee(e.target.value)}
      />
      <Input
        placeholder='Amount'
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <Button disabled={isPending} onClick={async () => await mutateAsync()}>
        {isPending ? (
          <div className='flex flex-row items-center gap-2'>
            <Loader2 className='animate-spin' size={16} />
            Granting...
          </div>
        ) : (
          <>Grant</>
        )}
      </Button>
      <Button
        onClick={async () => {
          const data = await getCurrentAllowance(grantee);
          setAllowanceData(data);
        }}
      >
        Get Current Allowance
      </Button>
      {allowanceData ? (
        <pre>{JSON.stringify(allowanceData, null, 2)}</pre>
      ) : null}
    </div>
  );
};
