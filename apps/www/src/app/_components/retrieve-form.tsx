import React, { useState } from 'react';

import { useNillion } from '~/lib/hooks';
import { errorHandler } from '~/lib/utils';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';

import { Loader2 } from 'lucide-react';

export const RetrieveForm = () => {
  const [granter, setGranter] = useState<string>('');
  const [uid, setUid] = useState<string>('');

  const { getValue } = useNillion();

  const { mutateAsync, isPending } = useMutation({
    throwOnError: false,
    mutationFn: async () => {
      if (!uid) {
        throw new Error('Invalid UID');
      }

      const value = await getValue(uid, granter);
      return value;
    },
    onError: (err: unknown) => {
      toast.error(errorHandler(err));
    },
    onSuccess: (value) => {
      toast.success(`Value: ${value.data.toString()}`);
    },
  });

  return (
    <div className='flex flex-col gap-3 py-6'>
      <Input
        placeholder='Granter Address'
        value={granter}
        onChange={(e) => setGranter(e.target.value)}
      />
      <Input
        placeholder='UID'
        value={uid}
        onChange={(e) => setUid(e.target.value)}
      />
      <Button disabled={isPending} onClick={async () => await mutateAsync()}>
        {isPending ? (
          <div className='flex flex-row items-center gap-2'>
            <Loader2 className='animate-spin' size={16} />
            Retrieving...
          </div>
        ) : (
          <>Retrieve</>
        )}
      </Button>
    </div>
  );
};
