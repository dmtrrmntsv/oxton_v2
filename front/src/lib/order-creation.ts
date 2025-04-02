// frontend/src/lib/order-creation.ts
import { Address, beginCell, toNano } from "@ton/core";
import { TonConnectUI } from "@tonconnect/ui";

export async function createSignedOrder(order: {
  amount: number;
  price: number;
  baseToken: string;
  quoteToken: string;
  isBuy: boolean;
}) {
  const tonConnectUI = new TonConnectUI();
  
  // 1. Рассчитываем итоговую сумму с комиссией
  const totalAmount = order.isBuy 
    ? order.amount * order.price * 1.005 // Покупатель платит больше
    : order.amount * 1.005; // Продавец отправляет больше

  // 2. Создаем "гибкую" транзакцию без seqno
  const body = beginCell()
    .storeUint(0x12345678, 32) // opcode для DEX
    .storeCoins(toNano(totalAmount))
    .storeAddress(Address.parse(order.baseToken))
    .storeAddress(Address.parse(order.quoteToken))
    .storeUint(order.isBuy ? 1 : 0, 1)
    .storeUint(Math.floor(Date.now() / 1000) + 600, 32) // 10 мин TTL
    .endCell();

  // 3. Подписываем через TonConnect
  const result = await tonConnectUI.sendTransaction({
    validUntil: Math.floor(Date.now() / 1000) + 600,
    messages: [{
      address: order.isBuy ? order.quoteToken : order.baseToken,
      amount: toNano(totalAmount).toString(),
      payload: body.toBoc().toString("base64")
    }]
  });

  return {
    orderId: generateId(),
    boc: result.boc,
    userWallet: (await tonConnectUI.account).address,
    timestamp: Math.floor(Date.now() / 1000),
    amount: order.amount,
    price: order.price,
    isBuy: order.isBuy,
    status: 'pending'
  };
}