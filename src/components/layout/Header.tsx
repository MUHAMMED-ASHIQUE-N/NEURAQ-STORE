import { Link } from "react-router-dom";
import { ShoppingCart, Heart, User2, Menu, Search, Zap } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "../../components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { useState } from "react";

import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { getAuth, signOut as firebaseSignOut, signOut } from "firebase/auth";

export default function Header() {
  const [query, setQuery] = useState("");
  const { user, signOut } = useAuth();
  const handleLogout = async () => {
    const auth = getAuth();
    await firebaseSignOut(auth);
    signOut(); // your local sign out logic, if needed
    window.location.href = "/";
  };

  function onSearch(e: React.FormEvent) {
    // use native form submission to avoid router hooks here
    // keep default behavior — nothing to do in JS
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
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              <Zap className="w-5 h-5 text-white" />
            </div>

            <span className="text-xl md:text-2xl font-bold text-gray-800">
              Neuraq Store
            </span>
          </Link>
        </div>

        <form
          method="GET"
          action="/search"
          className="hidden flex-1 md:flex items-center max-w-xl"
        >
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              name="q"
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
          {user ? (
            <UserMenu userName={user.name} onLogout={handleLogout} />
          ) : (
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
          )}
          <CartButton />
        </div>
      </div>

      <div className="md:hidden border-t">
        <form method="GET" action="/search" className="container py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              name="q"
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
            to="/products?category=amazon"
            className="text-muted-foreground hover:text-foreground"
          >
            Amazon
          </Link>
          <Link
            to="/products?category=local"
            className="text-muted-foreground hover:text-foreground"
          >
            Local
          </Link>
          <Link
            to="/products?category=software"
            className="text-muted-foreground hover:text-foreground"
          >
            Software
          </Link>
          <Link to="/deals" className="text-primary">
            Deals
          </Link>
        </div>
      </div>
    </header>
  );
}

function UserMenu({
  userName,
  onLogout,
}: {
  userName: string;
  onLogout: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="inline-flex items-center">
          <User2 className="mr-2 h-4 w-4" />
          <span className="hidden md:inline">{userName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link to="/orders" className="w-full">
            My Orders
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/account" className="w-full">
            Profile Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
