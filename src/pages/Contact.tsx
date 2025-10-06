import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

export default function ContactPage() {
  return (
    <div className="container py-8 md:py-10">
      <h1 className="text-2xl font-bold">Contact</h1>
      <div className="mt-6 grid gap-6 max-w-2xl">
        <input
          className="h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
          placeholder="Your name"
        />
        <input
          className="h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
          placeholder="Email address"
          type="email"
        />
        <textarea
          className="min-h-[160px] w-full rounded-md border bg-background px-3 py-2 text-sm"
          placeholder="Your message"
          rows={6}
        />
        <Button
          type="button"
          onClick={() =>
            alert("Thanks for reaching out! This demo does not send emails.")
          }
        >
          Send message
        </Button>
      </div>
    </div>
  );
}
