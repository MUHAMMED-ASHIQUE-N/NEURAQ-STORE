import { useState } from "react";
import { useCart } from "../contexts/CartContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Separator } from "../components/ui/separator";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { addOrder } from "../data/orders";
import { useAuth } from "../contexts/AuthContext";

function currency(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(n);
}

export default function CartCheckout() {
  const { items, remove, updateQty, subtotal, clear } = useCart();
  const [pincode, setPincode] = useState("");
  const [coupon, setCoupon] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const shipping = subtotal > 100 ? 0 : subtotal ? 8 : 0;
  const tax = subtotal * 0.08;
  const discount =
    coupon.trim().toUpperCase() === "SAVE10" ? subtotal * 0.1 : 0;
  const total = subtotal + shipping + tax - discount;

  return (
    <div className="container py-8 md:py-10">
      <Tabs defaultValue="cart">
        <TabsList>
          <TabsTrigger value="cart">Cart</TabsTrigger>
          <TabsTrigger value="checkout" disabled={!items.length}>
            Checkout
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cart" className="mt-6">
          {items.length === 0 ? (
            <p className="text-muted-foreground">Your cart is empty.</p>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1fr,380px]">
              <section className="space-y-4">
                {items.map((i) => (
                  <div key={i.id} className="flex gap-4 rounded-xl border p-4">
                    <img
                      src={i.image}
                      alt={i.name}
                      className="h-24 w-24 rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium">{i.name}</div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            {currency(i.price)}
                          </div>
                        </div>
                        <button
                          className="text-sm text-muted-foreground hover:text-foreground"
                          onClick={() => remove(i.id)}
                        >
                          Remove
                        </button>
                      </div>
                      <div className="mt-3 inline-flex items-center rounded-md border">
                        <button
                          className="px-3 py-1.5"
                          onClick={() => updateQty(i.id, i.qty - 1)}
                        >
                          -
                        </button>
                        <span className="min-w-10 text-center">{i.qty}</span>
                        <button
                          className="px-3 py-1.5"
                          onClick={() => updateQty(i.id, i.qty + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="hidden text-right sm:block">
                      <div className="font-semibold">
                        {currency(i.price * i.qty)}
                      </div>
                    </div>
                  </div>
                ))}
              </section>

              <aside className="h-fit rounded-xl border p-4">
                <h3 className="text-sm font-semibold">Summary</h3>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{currency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping ? currency(shipping) : "Free"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{currency(tax)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount</span>
                      <span>-{currency(discount)}</span>
                    </div>
                  )}
                </div>

                <Separator className="my-3" />

                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{currency(total)}</span>
                </div>

                <div className="mt-4 grid gap-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="Enter pincode to estimate shipping"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      placeholder="Coupon code (try SAVE10)"
                    />
                    <Button variant="outline" onClick={() => null}>
                      Apply
                    </Button>
                  </div>
                  <Button asChild disabled={!items.length}>
                    <a href="#checkout">Proceed to Checkout</a>
                  </Button>
                </div>
              </aside>
            </div>
          )}
        </TabsContent>

        <TabsContent value="checkout" className="mt-6" id="checkout">
          <div className="grid gap-8 lg:grid-cols-[1fr,380px]">
            <section className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold">Delivery address</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Input placeholder="Full name" />
                  <Input placeholder="Phone number" />
                  <Input placeholder="Pincode" />
                  <Input placeholder="City" />
                  <Input placeholder="State" />
                  <Input
                    placeholder="Address line 1"
                    className="sm:col-span-2"
                  />
                  <Input
                    placeholder="Address line 2 (optional)"
                    className="sm:col-span-2"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold">Delivery options</h3>
                <RadioGroup defaultValue="standard" className="mt-3">
                  <label className="flex items-center justify-between rounded-md border p-3">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="standard" id="standard" />
                      <Label htmlFor="standard">Standard (3-5 days)</Label>
                    </div>
                    <span className="text-sm">Free</span>
                  </label>
                  <label className="mt-2 flex items-center justify-between rounded-md border p-3">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="express" id="express" />
                      <Label htmlFor="express">Express (1-2 days)</Label>
                    </div>
                    <span className="text-sm">$12</span>
                  </label>
                </RadioGroup>
              </div>

              <div>
                <h3 className="text-sm font-semibold">Payment</h3>
                <RadioGroup defaultValue="card" className="mt-3">
                  <label className="flex items-center gap-2">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card">Credit/Debit Card</Label>
                  </label>
                  <label className="mt-2 flex items-center gap-2">
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi">UPI</Label>
                  </label>
                  <label className="mt-2 flex items-center gap-2">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod">Cash on Delivery</Label>
                  </label>
                </RadioGroup>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Input placeholder="Card number" />
                  <Input placeholder="Name on card" />
                  <Input placeholder="Expiry MM/YY" />
                  <Input placeholder="CVV" />
                </div>
              </div>

              <Button
                onClick={() => {
                  const orderTotal = total;
                  addOrder(user?.id ?? "guest", {
                    items,
                    subtotal,
                    shipping,
                    tax,
                    discount,
                    total: orderTotal,
                  });
                  clear();
                  navigate("/orders");
                }}
              >
                Place order
              </Button>
            </section>

            <aside className="h-fit rounded-xl border p-4">
              <h3 className="text-sm font-semibold">Order summary</h3>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Items</span>
                  <span>{currency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{subtotal > 100 ? "Free" : "$8"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{currency(subtotal * 0.08)}</span>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>
                  {currency(
                    subtotal + (subtotal > 100 ? 0 : 8) + subtotal * 0.08
                  )}
                </span>
              </div>
            </aside>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
