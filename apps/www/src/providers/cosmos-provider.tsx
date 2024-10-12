'use client';

import React, { type PropsWithChildren } from 'react';

import { cosmoshubTestnet, nillionTestnet } from '~/lib/chain';

import { ConnectKitProvider } from '@nillion-tools/connect-kit';
import { GrazProvider } from 'graz';

export const CosmosProvider = ({ children }: PropsWithChildren) => {
  return (
    <GrazProvider
      grazOptions={{
        chains: [nillionTestnet, cosmoshubTestnet],
        autoReconnect: false,
      }}
    >
      <ConnectKitProvider chains={[nillionTestnet, cosmoshubTestnet]}>
        {children}
      </ConnectKitProvider>
    </GrazProvider>
  );
};
