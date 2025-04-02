import { TonConnectButton, useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import { useState, useEffect } from 'react';
import { 
  MantineProvider,
  AppShell,
  Card, 
  Text, 
  Stack, 
  Notification,
  Group,
  Loader
} from '@mantine/core';
import OrderComponent from './components/OrderComponent';
import { Balances } from './components/Balances';

export default function App() {
  const address = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();
  const [connectionStatus, setConnectionStatus] = useState<string>('idle');
  const [lastEvent, setLastEvent] = useState<string>('');
  const [notification, setNotification] = useState<{show: boolean, message: string, isError: boolean}>({show: false, message: '', isError: false});

  useEffect(() => {
    if (!tonConnectUI) return;

    const unsubscribe = tonConnectUI.onStatusChange((wallet) => {
      if (wallet) {
        setConnectionStatus('connected');
        setLastEvent('Wallet connected');
        setNotification({show: true, message: 'Wallet connected successfully', isError: false});
      } else {
        setConnectionStatus('disconnected');
        setLastEvent('Wallet disconnected');
      }
    });

    return () => unsubscribe();
  }, [tonConnectUI]);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm' }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Text size="xl" fw={700}>TON Token Exchange</Text>
          {tonConnectUI && <tonConnectUI.ConnectButton />}
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section>
          <Text size="xl" fw={700} mb="md">
            TON Exchange
          </Text>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
          {notification.show && (
            <Notification
              title={notification.isError ? 'Error' : 'Success'}
              color={notification.isError ? 'red' : 'green'}
              onClose={() => setNotification({...notification, show: false})}
              style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}
            >
              {notification.message}
            </Notification>
          )}

          {address ? (
            <Stack gap="md" maw={1200} mx="auto">
              <Card withBorder shadow="sm" radius="md" p="lg">
                <Text size="lg" fw={700} mb="sm">
                  Wallet Information
                </Text>
                <Stack gap="xs">
                  <Group>
                    <Text fw={500}>Address:</Text>
                    <Text>{address}</Text>
                  </Group>
                  <Group>
                    <Text fw={500}>Status:</Text>
                    <Text>{connectionStatus}</Text>
                  </Group>
                  <Group>
                    <Text fw={500}>Last Event:</Text>
                    <Text>{lastEvent || 'None'}</Text>
                  </Group>
                </Stack>
                
                <Balances />
              </Card>

              <OrderComponent 
                onNotification={(message, isError) => 
                  setNotification({show: true, message, isError})
                }
              />
            </Stack>
          ) : (
            <Card withBorder shadow="sm" radius="md" p="xl" maw={500} mx="auto" my="xl" ta="center">
              <Text size="xl" fw={700} mb="md">
                Connect Your Wallet
              </Text>
              <Text c="dimmed" mb="lg">
                Please connect your TON wallet to start trading
              </Text>
              <TonConnectButton />
            </Card>
          )}
        </AppShell.Main>
      </AppShell>
  );
}