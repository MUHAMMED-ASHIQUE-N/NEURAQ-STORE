import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-16 border-t bg-white/60 dark:bg-background/70">
      <div className="container grid gap-10 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-extrabold tracking-tight">
            <span className="h-8 w-8 rounded bg-primary from-primary to-indigo-500 bg-gradient-to-br" />
            <span className="text-xl">Aurora</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground max-w-xs">
            Premium e-commerce experience with stunning design and blazing-fast performance.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Shop</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/products" className="hover:text-foreground">All products</Link></li>
            <li><Link to="/products?category=fashion" className="hover:text-foreground">Fashion</Link></li>
            <li><Link to="/products?category=electronics" className="hover:text-foreground">Electronics</Link></li>
            <li><Link to="/products?category=home" className="hover:text-foreground">Home & living</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Company</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-foreground">About us</Link></li>
            <li><Link to="/careers" className="hover:text-foreground">Careers</Link></li>
            <li><Link to="/blog" className="hover:text-foreground">Blog</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Stay in the loop</h4>
          <p className="mt-3 text-sm text-muted-foreground">Get exclusive offers straight to your inbox.</p>
          <form className="mt-3 flex gap-2">
            <input type="email" required placeholder="Email address" className="h-10 flex-1 rounded-md border bg-background px-3 text-sm outline-none ring-0 focus:border-primary" />
            <button className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">Subscribe</button>
          </form>
        </div>
      </div>
      <div className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Aurora. All rights reserved.
      </div>
    </footer>
  );
}
