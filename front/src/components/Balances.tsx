import { useTonAddress } from '@tonconnect/ui-react';
import { useState, useEffect } from 'react';
import { TonClient, Address } from '@ton/ton';
import { JettonMaster } from '@ton/ton';
import { Group, Text, Loader, Stack } from '@mantine/core'; // Added Stack import

const JETTONS = {
  SCALE: 'EQBlqsm144Dq6SjbPI4jjZvA1hqTIP3CvHovbIfW_t-SCALE',
  USDT: 'EQBynBO23ywHy_CgarY9NK9FTz0yDsG8PtPSU6T2zJ5wakby'
};

export const Balances = () => {
  const address = useTonAddress();
  const [balances, setBalances] = useState({
    ton: '0',
    jettons: {} as Record<string, string>,
    loading: false,
    error: null as string | null
  });

  const client = new TonClient({
    endpoint: 'https://toncenter.com/api/v2/jsonRPC',
    apiKey: process.env.REACT_APP_TON_API_KEY
  });

  const fetchBalances = async (walletAddress: string) => {
    setBalances(prev => ({...prev, loading: true, error: null}));
    
    try {
      const tonBalance = await client.getBalance(Address.parse(walletAddress));
      const jettonBalances: Record<string, string> = {};
      
      for (const [name, jettonAddress] of Object.entries(JETTONS)) {
        try {
          const jettonMaster = client.open(JettonMaster.create(Address.parse(jettonAddress)));
          const jettonWalletAddress = await jettonMaster.getWalletAddress(Address.parse(walletAddress));
          const jettonWalletBalance = await client.getBalance(jettonWalletAddress);
          jettonBalances[name] = jettonWalletBalance.toString();
        } catch (e) {
          console.error(`Error fetching ${name} balance:`, e);
          jettonBalances[name] = 'Error';
        }
      }
      
      setBalances({
        ton: tonBalance.toString(),
        jettons: jettonBalances,
        loading: false,
        error: null
      });
    } catch (error) {
      setBalances(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to fetch balances'
      }));
    }
  };

  useEffect(() => {
    if (address) fetchBalances(address);
  }, [address]);

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <Text size="lg" fw={700} mb="sm">
        Your Balances
      </Text>
      
      {balances.loading ? (
        <Group>
          <Loader size="sm" />
          <Text>Loading balances...</Text>
        </Group>
      ) : balances.error ? (
        <Text c="red">{balances.error}</Text>
      ) : (
        <Stack gap="xs"> {/* Now using properly imported Stack */}
          <Group justify="space-between">
            <Text fw={500}>TON</Text>
            <Text>{balances.ton}</Text>
          </Group>
          {Object.entries(balances.jettons).map(([name, balance]) => (
            <Group key={name} justify="space-between">
              <Text fw={500}>{name}</Text>
              <Text>{balance}</Text>
            </Group>
          ))}
        </Stack>
      )}
    </div>
  );
};