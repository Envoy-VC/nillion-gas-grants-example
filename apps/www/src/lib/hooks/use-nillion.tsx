import { create } from '@bufbuild/protobuf';
import { GasPrice, QueryClient } from '@cosmjs/stargate';
import { setupFeegrantExtension } from '@cosmjs/stargate/build/modules';
import {
  ChainId,
  ClusterId,
  Days,
  Multiaddr,
  NadaValue,
  NadaValues,
  NamedValue,
  NodeSeed,
  Operation,
  PaymentReceipt,
  StoreAcl,
  StoreId,
  Url,
  UserId,
  UserSeed,
} from '@nillion/client-core';
import { NilChainProtobufTypeUrl } from '@nillion/client-payments';
import { useNillion as useNillionCore } from '@nillion/client-react-hooks';
import {
  BasicAllowance,
  Grant,
} from 'cosmjs-types/cosmos/feegrant/v1beta1/feegrant';
import { Effect } from 'effect';
import {
  useAccount,
  useBalance,
  useOfflineSigners,
  useStargateSigningClient,
  useTendermintClient,
} from 'graz';
import { useLocalStorage } from 'usehooks-ts';

import { nillionTestnet } from '../chain';
import { MsgPayForCompatWrapper, MsgPayForSchema } from '../protobuf';

export const useNillion = () => {
  const { data: address } = useAccount({
    chainId: nillionTestnet.chainId,
  });
  const { data: signer } = useStargateSigningClient({
    chainId: nillionTestnet.chainId,
    opts: {
      gasPrice: GasPrice.fromString('0.0unil'),
    },
  });

  const { data: tmClient } = useTendermintClient({
    type: 'tm34',
    chainId: nillionTestnet.chainId,
  });

  const { client } = useNillionCore();

  const [seed] = useLocalStorage<[string, string]>('gas-grant-demo-seed', [
    crypto.randomUUID(),
    crypto.randomUUID(),
  ]);

  const { data } = useOfflineSigners({ chainId: nillionTestnet.chainId });

  const { refetch: refetchBalance } = useBalance({
    chainId: nillionTestnet.chainId,
    denom: nillionTestnet.stakeCurrency.coinMinimalDenom,
    bech32Address: address?.bech32Address,
  });

  const getBalance = async () => {
    return (await refetchBalance()).data;
  };

  const approveFeeGrant = async (grantee: string, amount: bigint) => {
    if (!address) {
      throw new Error('No account available');
    }
    if (!amount) {
      throw new Error('No amount provided');
    }
    if (!signer) {
      throw new Error('No signer available');
    }

    const grantFeeMsg = {
      typeUrl: '/cosmos.feegrant.v1beta1.MsgGrantAllowance',
      value: Grant.fromPartial({
        granter: address.bech32Address,
        grantee,
        allowance: {
          typeUrl: '/cosmos.feegrant.v1beta1.BasicAllowance',
          value: BasicAllowance.encode(
            BasicAllowance.fromPartial({
              spendLimit: [
                {
                  denom: nillionTestnet.stakeCurrency.coinMinimalDenom,
                  amount: amount.toString(),
                },
              ],
            })
          ).finish(),
        },
      }),
    };

    const parsedAmount = (Number(amount) / 10 ** 6).toFixed(3);
    const hash = await signer.signAndBroadcastSync(
      address.bech32Address,
      [grantFeeMsg],
      'auto',
      `Grant ${parsedAmount} ${nillionTestnet.stakeCurrency.coinMinimalDenom} to ${grantee}`
    );
    return hash;
  };

  const revokeFeeGrant = async (grantee: string) => {
    if (!address) {
      throw new Error('No account available');
    }

    if (!signer) {
      throw new Error('No signer available');
    }

    const message = {
      typeUrl: '/cosmos.feegrant.v1beta1.MsgRevokeAllowance',
      value: {
        granter: address.bech32Address,
        grantee,
      },
    };
    const gasNeeded = await signer.simulate(
      address.bech32Address,
      [message],
      `Revoke Allowance from ${grantee}`
    );

    const hash = await signer.signAndBroadcastSync(
      address.bech32Address,
      [message],
      { amount: [], gas: String(gasNeeded + 30_000) },
      `Revoke Allowance from ${grantee}`
    );
    return hash;
  };

  const storeValue = async (value: number, granter: string) => {
    if (!address) {
      throw new Error('No account available');
    }
    if (!value) {
      throw new Error('No value provided');
    }
    if (!signer) {
      throw new Error('No signer available');
    }

    signer.registry.register(NilChainProtobufTypeUrl, MsgPayForCompatWrapper);
    const s = data?.offlineSignerAuto
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
      nilChainEndpoint: Url.parse('https://nillion-testnet.rpc.kjnodes.com'),
    });

    client.setUserCredentials({
      nodeSeed: NodeSeed.parse(seed[0]),
      userSeed: UserSeed.parse(seed[1]),
      signer: s,
    });

    const isConnected = await client.connect();

    if (!isConnected) {
      throw new Error('Failed to connect to the chain');
    }

    const secrets = NadaValues.create();
    secrets.insert(
      NamedValue.parse('test123'),
      NadaValue.createSecretInteger(value)
    );

    const acl = StoreAcl.create();

    acl.allowRetrieve(UserId.parse(client.userId));

    const operation = Operation.storeValues({
      values: secrets,
      ttl: Days.parse(1),
      acl,
    });

    const quote = await client.fetchOperationQuote({ operation });

    if (quote.err) {
      throw new Error(quote.err.message);
    }
    const quoteData = quote.ok;
    const msg = create(MsgPayForSchema, {
      fromAddress: address.bech32Address,
      resource: quoteData.nonce,
      amount: [{ denom: 'unil', amount: String(quoteData.cost.total) }],
    });

    const gasNeeded = await signer.simulate(
      address.bech32Address,
      [{ typeUrl: NilChainProtobufTypeUrl, value: msg }],
      `Pay Quote for Storing Value`
    );

    console.log('Balance Before: ', await getBalance());

    const hash = await signer.signAndBroadcastSync(
      address.bech32Address,
      [{ typeUrl: NilChainProtobufTypeUrl, value: msg }],
      { amount: msg.amount, gas: String(gasNeeded), granter },
      `Pay Quote for Storing Value`
    );

    console.log('Amount Used: ', quoteData.cost.total);
    console.log('Gas Used: ', gasNeeded);

    const receipt = PaymentReceipt.parse({
      quote: quoteData,
      hash,
    });

    const storeId = await Effect.runPromise(
      client.vm.storeValues({
        receipt,
        operation,
      })
    );
    console.log('Balance After: ', await getBalance());

    console.log('Store Id: ', storeId);

    return storeId;
  };

  const getValue = async (uid: string, granter: string) => {
    if (!address) {
      throw new Error('No account available');
    }
    if (!uid) {
      throw new Error('No UID provided');
    }
    if (!signer) {
      throw new Error('No signer available');
    }

    signer.registry.register(NilChainProtobufTypeUrl, MsgPayForCompatWrapper);
    const s = data?.offlineSignerAuto
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
      nilChainEndpoint: Url.parse('https://nillion-testnet.rpc.kjnodes.com'),
    });

    client.setUserCredentials({
      nodeSeed: NodeSeed.parse(seed[0]),
      userSeed: UserSeed.parse(seed[1]),
      signer: s,
    });

    const isConnected = await client.connect();

    if (!isConnected) {
      throw new Error('Failed to connect to the chain');
    }

    const operation = Operation.fetchValue({
      id: StoreId.parse(uid),
      name: NamedValue.parse('test123'),
      type: 'SecretInteger',
    });

    const quote = await client.fetchOperationQuote({ operation });

    if (quote.err) {
      throw new Error(quote.err.message);
    }
    const quoteData = quote.ok;
    const msg = create(MsgPayForSchema, {
      fromAddress: address.bech32Address,
      resource: quoteData.nonce,
      amount: [{ denom: 'unil', amount: String(quoteData.cost.total) }],
    });

    const gasNeeded = await signer.simulate(
      address.bech32Address,
      [{ typeUrl: NilChainProtobufTypeUrl, value: msg }],
      `Pay Quote for Retrieving Value`
    );

    console.log('Balance Before: ', await getBalance());

    const hash = await signer.signAndBroadcastSync(
      address.bech32Address,
      [{ typeUrl: NilChainProtobufTypeUrl, value: msg }],
      { amount: msg.amount, gas: String(gasNeeded), granter },
      `Pay Quote for Retrieving Value`
    );

    const receipt = PaymentReceipt.parse({
      quote: quoteData,
      hash,
    });

    const value = await Effect.runPromise(
      client.vm.fetchValue({
        receipt,
        operation,
      })
    );

    console.log('Amount Used: ', quoteData.cost.total);
    console.log('Gas Used: ', gasNeeded);

    // wait 5 sec
    await new Promise((resolve) => {
      setTimeout(resolve, 5000);
    });

    console.log('Balance After: ', await getBalance());

    console.log('Value: ', value.data.toString());

    return value;
  };

  const getCurrentAllowance = async (grantee: string) => {
    if (!address) return null;
    if (!tmClient) return null;
    const queryClient = new QueryClient(tmClient);
    const c = setupFeegrantExtension(queryClient);
    const res = await c.feegrant.allowance(address.bech32Address, grantee);
    if (res.allowance?.allowance) {
      return {
        granter: res.allowance.granter,
        grantee: res.allowance.grantee,
        amount: BasicAllowance.decode(res.allowance.allowance.value),
      };
    }
    return {};
  };

  return {
    approveFeeGrant,
    revokeFeeGrant,
    storeValue,
    getBalance,
    getCurrentAllowance,
    getValue,
  };
};
