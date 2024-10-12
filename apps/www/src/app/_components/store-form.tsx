import React, { useState } from 'react';

import { useNillion } from '~/lib/hooks';
import { errorHandler } from '~/lib/utils';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';

import { Loader2 } from 'lucide-react';

export const StoreForm = () => {
  const [granter, setGranter] = useState<string>('');
  const [value, setValue] = useState<string>('');

  const { storeValue } = useNillion();

  const { mutateAsync, isPending } = useMutation({
    throwOnError: false,
    mutationFn: async () => {
      if (!Number.isInteger(Number(value))) {
        throw new Error('Invalid value');
      }
      if (Number(value) <= 0) {
        throw new Error('value must be greater than 0');
      }

      const storeId = await storeValue(Number(value), granter);
      return storeId;
    },
    onError: (err: unknown) => {
      toast.error(errorHandler(err));
    },
    onSuccess: (storeId) => {
      toast.success(`Value Stored: ${storeId}`);
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
        placeholder='Value'
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <Button disabled={isPending} onClick={async () => await mutateAsync()}>
        {isPending ? (
          <div className='flex flex-row items-center gap-2'>
            <Loader2 className='animate-spin' size={16} />
            Storing...
          </div>
        ) : (
          <>Store</>
        )}
      </Button>
    </div>
  );
};
