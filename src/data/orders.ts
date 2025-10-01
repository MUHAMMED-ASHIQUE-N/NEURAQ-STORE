import type { CartItem } from "../contexts/CartContext";

export type Order = {
  id: string;
  createdAt: number;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
};

export type NewOrder = Omit<Order, "id" | "createdAt">;

const storageKey = "aurora_orders_v1";

type OrdersStore = Record<string, Order[]>; // userId -> orders

function readStore(): OrdersStore {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as OrdersStore) : {};
  } catch {
    return {};
  }
}

function writeStore(store: OrdersStore) {
  localStorage.setItem(storageKey, JSON.stringify(store));
}

export function getOrders(userId: string): Order[] {
  const store = readStore();
  return store[userId]
    ? [...store[userId]].sort((a, b) => b.createdAt - a.createdAt)
    : [];
}

export function addOrder(userId: string, order: NewOrder): Order {
  const store = readStore();
  const full: Order = {
    ...order,
    id: `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };
  const list = store[userId] ?? [];
  store[userId] = [full, ...list];
  writeStore(store);
  return full;
}
