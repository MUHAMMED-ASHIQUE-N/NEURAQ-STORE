import ProductCard, { type Product } from "../components/shop/ProductCard";
import { Link } from "react-router-dom";
import HeroCarousel from "../components/shop/HeroCarousel";

export default function Index() {
  return (
    <div>
      <Hero />
      <FeaturedSections />
      <FeaturedProducts />
      <DealsBar />
    </div>
  );
}

function Hero() {
  return <HeroCarousel />;
}

function FeaturedSections() {
  const categories = [
    {
      title: "Fashion",
      href: "/products?category=fashion",
      image:
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop",
    },
    {
      title: "Electronics",
      href: "/products?category=electronics",
      image:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
    },
    {
      title: "Home & Living",
      href: "/products?category=home",
      image:
        "https://images.unsplash.com/photo-1484101403633-562f891dc89a?q=80&w=1200&auto=format&fit=crop",
    },
  ];

  return (
    <section className="container mt-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Link
            key={c.title}
            to={c.href}
            className="group relative overflow-hidden rounded-2xl border"
          >
            <img
              src={c.image}
              alt={c.title}
              className="h-52 w-full object-cover transition-transform duration-300 group-hover:scale-105 md:h-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-0 p-5 text-white">
              <h3 className="text-lg font-semibold">{c.title}</h3>
              <p className="text-xs text-white/80">Explore now</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FeaturedProducts() {
  const products: Product[] = [
    {
      id: "f1",
      name: "Noise Cancelling Headphones",
      price: 149,
      originalPrice: 219,
      rating: 5,
      reviews: 412,
      image:
        "https://images.unsplash.com/photo-1518443855757-8d2f50a94f21?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "f2",
      name: "Minimal Desk Lamp",
      price: 59,
      originalPrice: 79,
      rating: 4,
      reviews: 123,
      image:
        "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "f3",
      name: "Classic Linen Shirt",
      price: 39,
      originalPrice: 59,
      rating: 4,
      reviews: 89,
      image:
        "https://images.unsplash.com/photo-1520975859264-05d80fcf0b3f?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "f4",
      name: "Everyday Sneakers",
      price: 89,
      originalPrice: 109,
      rating: 5,
      reviews: 240,
      image:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop",
    },
  ];

  return (
    <section className="container mt-12 md:mt-16">
      <div className="flex items-end justify-between">
        <h2 className="text-xl font-semibold md:text-2xl">Featured Products</h2>
        <Link
          to="/products"
          className="text-sm font-medium text-primary hover:underline"
        >
          View all
        </Link>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

function DealsBar() {
  return (
    <section className="container mt-12 md:mt-16">
      <div className="grid gap-4 md:grid-cols-3">
        <PromoCard
          title="Free shipping"
          desc="on orders over $100"
          gradient="from-primary to-indigo-500"
        />
        <PromoCard
          title="30-day returns"
          desc="hassle-free guarantee"
          gradient="from-fuchsia-500 to-rose-500"
        />
        <PromoCard
          title="Secure payments"
          desc="cards, UPI & wallets"
          gradient="from-emerald-500 to-teal-500"
        />
      </div>
    </section>
  );
}

function PromoCard({
  title,
  desc,
  gradient,
}: {
  title: string;
  desc: string;
  gradient: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-6 text-white`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      <div className="relative">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-white/90">{desc}</p>
      </div>
    </div>
  );
}
