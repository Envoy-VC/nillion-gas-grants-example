export const nillionTestnet = {
  rpc: 'https://nillion-testnet.rpc.kjnodes.com',
  rest: 'https://testnet-nillion-api.lavenderfive.com',
  nodeProvider: {
    name: 'Lavender.Five',
    email: 'hello@lavenderfive.com',
    website: 'https://www.lavenderfive.com/',
  },
  chainId: 'nillion-chain-testnet-1',
  chainName: 'Nillion Testnet',
  chainSymbolImageUrl:
    'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/nillion-chain-testnet/nil.png',
  stakeCurrency: {
    coinDenom: 'NIL',
    coinMinimalDenom: 'unil',
    coinDecimals: 6,
    coinImageUrl:
      'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/nillion-chain-testnet/nil.png',
  },
  bip44: {
    coinType: 118,
  },
  bech32Config: {
    bech32PrefixAccAddr: 'nillion',
    bech32PrefixAccPub: 'nillionpub',
    bech32PrefixValAddr: 'nillionvaloper',
    bech32PrefixValPub: 'nillionvaloperpub',
    bech32PrefixConsAddr: 'nillionvalcons',
    bech32PrefixConsPub: 'nillionvalconspub',
  },
  currencies: [
    {
      coinDenom: 'NIL',
      coinMinimalDenom: 'unil',
      coinDecimals: 6,
      coinImageUrl:
        'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/nillion-chain-testnet/nil.png',
    },
  ],
  feeCurrencies: [
    {
      coinDenom: 'NIL',
      coinMinimalDenom: 'unil',
      coinDecimals: 6,
      coinImageUrl:
        'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/nillion-chain-testnet/nil.png',
      gasPriceStep: {
        low: 0.001,
        average: 0.001,
        high: 0.01,
      },
    },
  ],
  features: [],
};

export const cosmoshubTestnet = {
  rpc: 'https://rpc.sentry-01.theta-testnet.polypore.xyz',
  rest: 'https://rest.sentry-01.theta-testnet.polypore.xyz',
  chainId: 'theta-testnet-001',
  chainName: 'Cosmos Hub Testnet',
  chainSymbolImageUrl:
    'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/cosmoshub/chain.png',
  bip44: {
    coinType: 118,
  },
  bech32Config: {
    bech32PrefixAccAddr: 'cosmos',
    bech32PrefixAccPub: 'cosmospub',
    bech32PrefixConsAddr: 'cosmosvalcons',
    bech32PrefixConsPub: 'cosmosvalconspub',
    bech32PrefixValAddr: 'cosmosvaloper',
    bech32PrefixValPub: 'cosmosvaloperpub',
  },
  stakeCurrency: {
    coinDecimals: 6,
    coinDenom: 'ATOM',
    coinMinimalDenom: 'uatom',
    coinImageUrl:
      'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/cosmoshub/uatom.png',
  },
  currencies: [
    {
      coinDecimals: 6,
      coinDenom: 'ATOM',
      coinMinimalDenom: 'uatom',
      coinImageUrl:
        'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/cosmoshub/uatom.png',
    },
  ],
  feeCurrencies: [
    {
      coinDecimals: 6,
      coinDenom: 'ATOM',
      coinMinimalDenom: 'uatom',
      coinImageUrl:
        'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/cosmoshub/uatom.png',
      gasPriceStep: {
        average: 0.025,
        high: 0.03,
        low: 0.01,
      },
    },
  ],
  features: [],
};
