import ProductCard, { type Product } from "../components/shop/ProductCard";
import { Link } from "react-router-dom";
import HeroCarousel from "../components/shop/HeroCarousel";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { db, firestore } from "../firebase";
import { useEffect, useState } from "react";
import { products as productData } from "../data/products";

type Product = {
  id: string;
  name: string;
  finalPrice: number;
  originalPrice?: number;
  description?: string;
  rating?: number; // 0-5
  reviews?: number;
  images?: [];
  quantity: number;
};
const allProducts: Product[] = productData.map((p) => ({
  id: p.id,
  name: p.name,
  price: p.finalPrice,
  originalPrice: p.originalPrice,
  image: p.images[0],
}));
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
      title: "Amazon",
      href: "/products?category=amazon",
      image:
        "https://images.unsplash.com/photo-1649734926695-1b1664e98842?q=80&w=1200&auto=format&fit=crop",
    },
    {
      title: "Local",
      href: "/products?category=local",
      image:
        "https://plus.unsplash.com/premium_photo-1681487985079-b299ac8ba1df?q=80&w=1200&auto=format&fit=crop",
    },
    {
      title: "Software",
      href: "/products?category=software",
      image:
        "https://plus.unsplash.com/premium_photo-1720287601013-69bed792f481?q=80&w=1200&auto=format&fit=crop",
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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetchAllProducts() {
      const collections = [
        "amazonProducts",
        "localProducts",
        "softwareProducts",
      ];
      let all: Product[] = [];
      for (const col of collections) {
        const snap = await getDocs(collection(db, col));
        all = [
          ...all,
          ...(snap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Product[]),
        ];
      }
      all.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setProducts(all.slice(0, 10));
      setLoading(false);
    }
    fetchAllProducts();
  }, []);
  if (loading) return <div>Loading...</div>;
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
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
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
