'use client';

import React, { type PropsWithChildren } from 'react';

import { nillionTestnet } from '~/lib/chain';

import {
  ChainId,
  ClusterId,
  Multiaddr,
  NodeSeed,
  Url,
  UserSeed,
} from '@nillion/client-core';
import { NillionProvider as NillionProviderCore } from '@nillion/client-react-hooks';
import { NillionClient } from '@nillion/client-vms';
import { useOfflineSigners } from 'graz';
import { useLocalStorage } from 'usehooks-ts';

export const NillionProvider = ({ children }: PropsWithChildren) => {
  const { data } = useOfflineSigners({ chainId: nillionTestnet.chainId });
  const [seed] = useLocalStorage<[string, string]>('gas-grant-demo-seed', [
    crypto.randomUUID(),
    crypto.randomUUID(),
  ]);

  const client = NillionClient.create();
  const signer = data?.offlineSignerAuto
    ? () => Promise.resolve(data.offlineSignerAuto)
    : 'keplr';

  client.setNetworkConfig({
    clusterId: ClusterId.parse('b13880d3-dde8-4a75-a171-8a1a9d985e6c'),
    bootnodes: [
      Multiaddr.parse(
        '/dns/node-1.testnet-photon.nillion-network.nilogy.xyz/tcp/14211/wss/p2p/12D3KooWCfFYAb77NCjEk711e9BVe2E6mrasPZTtAjJAPtVAdbye'
      ),
    ],
    nilChainId: ChainId.parse('nillion-chain-testnet-1'),
    nilChainEndpoint: Url.parse(
      'https://rpc.testnet.nilchain-rpc-proxy.nilogy.xyz'
    ),
  });
  client.setUserCredentials({
    nodeSeed: NodeSeed.parse(seed[0]),
    userSeed: UserSeed.parse(seed[1]),
    signer,
  });

  return <NillionProviderCore client={client}>{children}</NillionProviderCore>;
};
