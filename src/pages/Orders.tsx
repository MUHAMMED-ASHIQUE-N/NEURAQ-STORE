import { Link } from "react-router-dom";
import { getOrders, type Order } from "../data/orders";
import { useAuth } from "../contexts/AuthContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { firestore } from "../firebase";

function currency(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(n);
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      const ordersRef = collection(firestore, "users", user.id, "orders");
      const q = query(ordersRef, where("userId", "==", user.id));
      const querySnapshot = await getDocs(q);
      const ordersList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(ordersList); // Use setOrders here
    };

    fetchOrders();
  }, [user]);

  return (
    <div className="container py-8 md:py-10">
      <h1 className="text-2xl font-bold">My Orders</h1>
      {orders.length === 0 ? (
        <div className="mt-6 rounded-xl border p-6">
          <p className="text-muted-foreground">You have no orders yet.</p>
          <Link
            to="/products"
            className="mt-3 inline-block text-primary hover:underline"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                  Order ID:{" "}
                  <span className="font-mono text-foreground">{order.id}</span>
                </div>
                <div className="text-sm">
                  {new Date(order.createdAt?.toDate()).toLocaleString()}
                </div>
              </div>
              <div className="mt-3 grid gap-4 sm:grid-cols-[1fr,260px]">
                <div className="grid gap-3">
                  {order.items.map((item: any) => {
                    const qty = Number(item.qty) || 0;
                    const price = Number(item.price) || 0;
                    const totalPrice = currency(price * qty);

                    const orderDate = order.createdAt?.toDate
                      ? order.createdAt.toDate()
                      : new Date(order.createdAt);
                    const dateString = orderDate.toLocaleDateString();
                    return (
                      <div key={item.id} className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-14 w-14 rounded-md object-cover"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Qty: {qty}
                          </div>
                        </div>
                        <div className="text-right text-sm font-medium">
                          {currency(item.price * qty)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="rounded-lg border p-3 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{currency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>
                      {order.shipping ? currency(order.shipping) : "Free"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{currency(order.tax)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount</span>
                      <span>-{currency(order.discount)}</span>
                    </div>
                  )}
                  <div className="mt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{currency(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
