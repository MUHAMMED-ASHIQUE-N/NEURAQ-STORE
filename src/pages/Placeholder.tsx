import { useLocation } from "react-router-dom";

export default function Placeholder() {
  const { pathname } = useLocation();
  const title = titleFromPath(pathname);
  return (
    <div className="container py-16 text-center">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
        This page is scaffolded and ready to be built. Tell me what to include here next and I will design and implement it.
      </p>
    </div>
  );
}

function titleFromPath(p: string) {
  if (p.startsWith("/product/")) return "Product Details";
  const t = p.replaceAll("/", " ").trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : "Page";
}
