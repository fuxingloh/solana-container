import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { Connection, PublicKey } from '@solana/web3.js';

import { SolanaContainer, StartedSolanaContainer } from './index';

describe('SolanaContainer', () => {
  let container: StartedSolanaContainer;
  let connection: Connection;

  beforeAll(async () => {
    container = await new SolanaContainer().start();
    connection = new Connection(container.getHostRpcEndpoint(), {
      commitment: 'processed',
      wsEndpoint: container.getHostWsEndpoint(),
    });
  });

  afterAll(async () => {
    await container.stop();
  });

  it('should expose host rpc endpoint', async () => {
    expect(container.getHostRpcEndpoint()).toMatch(/http:\/\/localhost:\d+/);
  });

  it('should get processed block height', async () => {
    const blockHeight = await connection.getBlockHeight('processed');
    expect(blockHeight).toBeGreaterThanOrEqual(0);
  });

  it('should fund address with 5129000000 lamports with confirmation', async () => {
    const publicKey = new PublicKey('Emp8JcXpFnCXzdWBC3ChRPtNQHiiQW6kr61wopT3hbNL');
    const lamports = 5_129_000_000;

    const block = await connection.getLatestBlockhash('processed');
    const signature = await connection.requestAirdrop(publicKey, lamports);
    await connection.confirmTransaction({ signature, ...block }, 'processed');

    const balance = await connection.getBalance(publicKey, 'processed');
    expect(balance).toStrictEqual(lamports);
  });
});
