import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, User2, Menu, Search } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "../../components/ui/sheet";
import { useState } from "react";
import { useCart } from "../../contexts/CartContext";

export default function Header() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-background/70">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <nav className="mt-8 grid gap-2 text-sm">
                <Link to="/" className="rounded-md px-3 py-2 hover:bg-accent">
                  Home
                </Link>
                <Link
                  to="/products"
                  className="rounded-md px-3 py-2 hover:bg-accent"
                >
                  Shop
                </Link>
                <Link
                  to="/deals"
                  className="rounded-md px-3 py-2 hover:bg-accent"
                >
                  Deals
                </Link>
                <Link
                  to="/about"
                  className="rounded-md px-3 py-2 hover:bg-accent"
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="rounded-md px-3 py-2 hover:bg-accent"
                >
                  Contact
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          <Link
            to="/"
            className="inline-flex items-center gap-2 font-extrabold tracking-tight"
          >
            <span className="h-8 w-8 rounded bg-primary from-primary to-indigo-500 bg-gradient-to-br" />
            <span className="text-xl">Neuraq</span>
          </Link>
        </div>

        <form
          onSubmit={onSearch}
          className="hidden flex-1 md:flex items-center max-w-xl"
        >
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products, brands and more"
              className="pl-9"
            />
          </div>
        </form>

        <div className="flex items-center gap-1 md:gap-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden md:inline-flex"
          >
            <Link to="/wishlist">
              <Heart className="mr-2 h-4 w-4" /> Wishlist
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden md:inline-flex"
          >
            <Link to="/account">
              <User2 className="mr-2 h-4 w-4" /> Sign in
            </Link>
          </Button>
          <CartButton />
        </div>
      </div>

      <div className="md:hidden border-t">
        <form onSubmit={onSearch} className="container py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products, brands and more"
              className="pl-9"
            />
          </div>
        </form>
      </div>

      <div className="hidden border-t md:block">
        <div className="container flex h-12 items-center gap-6 text-sm">
          <Link
            to="/products"
            className="text-muted-foreground hover:text-foreground"
          >
            All Products
          </Link>
          <Link
            to="/products?category=fashion"
            className="text-muted-foreground hover:text-foreground"
          >
            Fashion
          </Link>
          <Link
            to="/products?category=electronics"
            className="text-muted-foreground hover:text-foreground"
          >
            Electronics
          </Link>
          <Link
            to="/products?category=home"
            className="text-muted-foreground hover:text-foreground"
          >
            Home
          </Link>
          <Link to="/deals" className="text-primary">
            Deals
          </Link>
        </div>
      </div>
    </header>
  );
}

function CartButton() {
  const { count } = useCart();
  return (
    <Button asChild variant="default" size="sm" className="relative">
      <Link to="/cart" className="inline-flex items-center">
        <ShoppingCart className="mr-2 h-4 w-4" />
        Cart
        <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-xs font-semibold text-primary">
          {count}
        </span>
      </Link>
    </Button>
  );
}
