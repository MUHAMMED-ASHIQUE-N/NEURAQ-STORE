import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../components/ui/carousel";
import { Button } from "../../components/ui/button";
import { Link } from "react-router-dom";

const slides = [
  {
    title: "New Season. New Style.",
    subtitle: "Discover premium fashion with up to 40% OFF",
    cta: "Shop Fashion",
    href: "/products?category=fashion",
    image:
      "https://images.unsplash.com/photo-1483181957632-8bda974cbc91?q=80&w=1600&auto=format&fit=crop",
  },
  {
    title: "Top Tech Deals",
    subtitle: "Laptops, headphones & more starting $99",
    cta: "Shop Electronics",
    href: "/products?category=electronics",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1600&auto=format&fit=crop",
  },
  {
    title: "Home Essentials",
    subtitle: "Upgrade your space with cozy picks",
    cta: "Shop Home",
    href: "/products?category=home",
    image:
      "https://images.unsplash.com/photo-1501045661006-fcebe0257c3f?q=80&w=1600&auto=format&fit=crop",
  },
];

export default function HeroCarousel() {
  return (
    <section className="container mt-6 md:mt-10">
      <div className="relative">
        <Carousel className="">
          <CarouselContent>
            {slides.map((s, i) => (
              <CarouselItem key={i}>
                <div className="relative overflow-hidden rounded-2xl">
                  <img
                    src={s.image}
                    alt={s.title}
                    className="h-[320px] w-full object-cover md:h-[440px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute inset-0 flex items-end p-6 md:p-10">
                    <div className="max-w-xl text-white">
                      <h2 className="text-2xl font-bold md:text-4xl">
                        {s.title}
                      </h2>
                      <p className="mt-2 text-sm text-white/90 md:text-base">
                        {s.subtitle}
                      </p>
                      <Button asChild size="lg" className="mt-4 md:mt-6">
                        <Link to={s.href}>{s.cta}</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-3 md:-left-6" />
          <CarouselNext className="-right-3 md:-right-6" />
        </Carousel>
      </div>
    </section>
  );
}
