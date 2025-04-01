import { TonConnectButton, useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import { useState, useEffect } from 'react';
import { 
  AppShell,
  Card, 
  Text, 
  Stack, 
  Notification,
  MantineProvider,
  createTheme
} from '@mantine/core';
import OrderComponent from './components/OrderComponent';
import '@mantine/core/styles.css';

const theme = createTheme({
  styles: {
    global: (theme) => ({
    body: {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
    },
  }),
});

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
    <MantineProvider theme={theme}>
      <AppShell
        header={{ height: 60 }}
        navbar={{ width: 300, breakpoint: 'sm' }}
        padding="md"
      >
        <AppShell.Header>
          <Text size="xl" p="xs">TON Token Exchange</Text>
        </AppShell.Header>

        <AppShell.Navbar p="xs">
          <AppShell.Section>
            <Text size="xl" fw={700} mb="md">
              TON Exchange
            </Text>
          </AppShell.Section>
          <AppShell.Section grow>
            {/* Навигационные ссылки */}
          </AppShell.Section>
          <AppShell.Section>
            <TonConnectButton />
          </AppShell.Section>
        </AppShell.Navbar>

        <AppShell.Main>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {notification.show && (
              <Notification
                title={notification.isError ? 'Error' : 'Success'}
                color={notification.isError ? 'red' : 'green'}
                onClose={() => setNotification({...notification, show: false})}
                style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}
              >
                {notification.message}
              </Notification>
            )}

            {address ? (
              <Stack gap="xl">
                <Card withBorder shadow="sm" radius="md">
                  <Text size="lg" fw={700} mb="sm">
                    Wallet Information
                  </Text>
                  <Text><strong>Address:</strong> {address}</Text>
                  <Text><strong>Status:</strong> {connectionStatus}</Text>
                  <Text><strong>Last Event:</strong> {lastEvent || 'None'}</Text>
                </Card>

                <OrderComponent 
                  onNotification={(message, isError) => 
                    setNotification({show: true, message, isError})
                  }
                />
              </Stack>
            ) : (
              <Card withBorder shadow="sm" radius="md" style={{ textAlign: 'center', padding: '40px' }}>
                <Text size="xl" fw={700} mb="md">
                  Connect Your Wallet
                </Text>
                <Text c="dimmed" mb="lg">
                  Please connect your TON wallet to start trading
                </Text>
                <TonConnectButton style={{ margin: '0 auto' }} />
              </Card>
            )}
          </div>
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}