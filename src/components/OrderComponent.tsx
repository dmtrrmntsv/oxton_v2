import { useState } from 'react';
import { 
  Card, 
  Text, 
  Button, 
  NumberInput, 
  Select, 
  Group, 
  Modal 
} from '@mantine/core';
import { useTonAddress } from '@tonconnect/ui-react';
import axios from 'axios';
import { v4 as generateId } from 'uuid';

interface OrderComponentProps {
  onNotification: (message: string, isError: boolean) => void;
}

const OrderComponent = ({ onNotification }: OrderComponentProps) => {
  const address = useTonAddress();
  const [order, setOrder] = useState({
    amount: 0,
    price: 0,
    is_buy: true,
    baseToken: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c', // TON
    quoteToken: 'EQBBJJBB3HagsujBqVfqeDUPJ0kXjgTPLWPFFffuNXNiJL0aA' // USDT
  });
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);

  const tokens = [
    { value: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c', label: 'TON' },
    { value: 'EQBBJJBB3HagsujBqVfqeDUPJ0kXjgTPLWPFFffuNXNiJL0aA', label: 'USDT' }
  ];

  const fee = 0.005; // 0.5% комиссия

  const calculatedValues = {
    buyOrderAmount: order.amount * order.price,
    totalBuyAmount: order.amount * order.price * (1 + fee),
    sellOrderAmount: order.amount,
    totalSellAmount: order.amount * (1 + fee)
  };

  const handleSubmit = async () => {
    if (!address) {
      onNotification('Wallet not connected', true);
      return;
    }

    if (order.amount <= 0 || order.price <= 0) {
      onNotification('Amount and price must be greater than 0', true);
      return;
    }

    setLoading(true);
    
    try {
      const orderData = {
        ...order,
        user_wallet: address,
        timestamp: Math.floor(Date.now() / 1000),
        fee,
        is_paired: false
      };

      console.log('Sending order data:', orderData); // Логируем данные перед отправкой

      const response = await axios.post('http://localhost:3000/api/orders', orderData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Order created:', response.data); // Логируем ответ
      onNotification('Order created successfully!', false);
      setOpened(false);
    } catch (error) {
      console.error('Full error:', error); // Подробное логирование ошибки
      
      let errorMessage = 'Failed to create order';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      }

      onNotification(errorMessage, true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder style={{ maxWidth: 500, margin: '20px auto' }}>
      <Text size="xl" fw={700} align="center" mb="md">
        Create New Order
      </Text>

      <Select
        label="Base Token"
        value={order.baseToken}
        onChange={(val: number) => setOrder({...order, amount: val || 0})}
        data={tokens}
        mb="sm"
      />

      <Select
        label="Quote Token"
        value={order.quoteToken}
        onChange={(value) => setOrder({...order, quoteToken: value || ''})}
        data={tokens}
        mb="sm"
      />

      <Group grow mb="sm">
        <Button 
          variant={order.is_buy ? 'filled' : 'outline'} 
          color="green"
          onClick={() => setOrder({...order, is_buy: true})}
        >
          Buy
        </Button>
        <Button 
          variant={!order.is_buy ? 'filled' : 'outline'} 
          color="red"
          onClick={() => setOrder({...order, is_buy: false})}
        >
          Sell
        </Button>
      </Group>

      <NumberInput
        label="Amount"
        value={order.amount}
        onChange={(val) => setOrder({...order, amount: val || 0})}
        decimalScale={2}
        min={0}
        step={0.1}
        mb="sm"
      />

      <NumberInput
        label="Price"
        value={order.price}
        onChange={(val) => setOrder({...order, price: val || 0})}
        decimalScale={2}
        min={0}
        step={0.01}
        mb="md"
      />

      <Card withBorder p="sm" mb="md">
        <Text size="sm">
          {order.is_buy ? 'You will pay:' : 'You will receive:'}
        </Text>
        <Text size="lg" weight={700}>
          {order.is_buy 
            ? `${calculatedValues.totalBuyAmount.toFixed(2)} ${tokens.find(t => t.value === order.quoteToken)?.label}`
            : `${calculatedValues.totalSellAmount.toFixed(1)} ${tokens.find(t => t.value === order.baseToken)?.label}`
          }
        </Text>
        <Text size="xs" color="dimmed">
          Fee: {fee * 100}% ({order.is_buy 
            ? `${(calculatedValues.buyOrderAmount * fee).toFixed(2)} ${tokens.find(t => t.value === order.quoteToken)?.label}`
            : `${(calculatedValues.sellOrderAmount * fee).toFixed(1)} ${tokens.find(t => t.value === order.baseToken)?.label}`
          })
        </Text>
      </Card>

      <Button 
        fullWidth 
        onClick={() => setOpened(true)}
        disabled={!address || order.amount <= 0 || order.price <= 0}
      >
        Create Order
      </Button>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Confirm Order"
      >
        <Text mb="md">Are you sure you want to create this order?</Text>
        
        <Group grow>
          <Button variant="outline" onClick={() => setOpened(false)}>
            Cancel
          </Button>
          <Button 
            color={order.is_buy ? 'green' : 'red'} 
            onClick={handleSubmit}
            loading={loading}
          >
            {order.is_buy ? 'Buy' : 'Sell'} {order.amount} {tokens.find(t => t.value === order.baseToken)?.label}
          </Button>
        </Group>
      </Modal>
    </Card>
  );
};

export default OrderComponent;