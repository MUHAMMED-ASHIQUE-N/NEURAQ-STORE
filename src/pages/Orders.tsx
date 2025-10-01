import { Link } from "react-router-dom";
import { getOrders, type Order } from "../data/orders";
import { useAuth } from "../contexts/AuthContext";

function currency(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(n);
}

export default function OrdersPage() {
  const { user } = useAuth();
  const orders: Order[] = getOrders(user?.id ?? "guest");

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
          {orders.map((o) => (
            <div key={o.id} className="rounded-xl border p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                  Order ID:{" "}
                  <span className="font-mono text-foreground">{o.id}</span>
                </div>
                <div className="text-sm">
                  {new Date(o.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="mt-3 grid gap-4 sm:grid-cols-[1fr,260px]">
                <div className="grid gap-3">
                  {o.items.map((i) => (
                    <div key={i.id} className="flex items-center gap-3">
                      <img
                        src={i.image}
                        alt={i.name}
                        className="h-14 w-14 rounded-md object-cover"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{i.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Qty: {i.qty}
                        </div>
                      </div>
                      <div className="text-right text-sm font-medium">
                        {currency(i.price * i.qty)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border p-3 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{currency(o.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{o.shipping ? currency(o.shipping) : "Free"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{currency(o.tax)}</span>
                  </div>
                  {o.discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount</span>
                      <span>-{currency(o.discount)}</span>
                    </div>
                  )}
                  <div className="mt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{currency(o.total)}</span>
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
