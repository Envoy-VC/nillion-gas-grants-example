import React, { useState } from 'react';

import { useNillion } from '~/lib/hooks';
import { errorHandler } from '~/lib/utils';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';

import { Loader2 } from 'lucide-react';

export const RevokeForm = () => {
  const [grantee, setGrantee] = useState<string>('');

  const { revokeFeeGrant } = useNillion();

  const { mutateAsync, isPending } = useMutation({
    throwOnError: false,
    mutationFn: async () => {
      // TODO: Validate Nillion Address
      const hash = await revokeFeeGrant(grantee);
      return hash;
    },
    onError: (err: unknown) => {
      toast.error(errorHandler(err));
    },
    onSuccess: (hash: string) => {
      toast.success(`Fee Grant revoked: ${hash}`);
    },
  });

  return (
    <div className='flex flex-col gap-3 py-6'>
      <Input
        placeholder='Grantee Address'
        value={grantee}
        onChange={(e) => setGrantee(e.target.value)}
      />

      <Button disabled={isPending} onClick={async () => await mutateAsync()}>
        {isPending ? (
          <div className='flex flex-row items-center gap-2'>
            <Loader2 className='animate-spin' size={16} />
            Revoking...
          </div>
        ) : (
          <>Revoke</>
        )}
      </Button>
    </div>
  );
};
