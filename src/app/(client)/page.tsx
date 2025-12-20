import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function IndexPage() {
    return (
        <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
            <div className="flex max-w-[980px] flex-col items-start gap-2">
                <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
                    Thinking in code <br className="hidden sm:inline" />
                    built with Refine & Next.js.
                </h1>
                <p className="max-w-[700px] text-lg text-muted-foreground">
                    This is a client-facing landing page demo. The admin panel is located at /dashboard.
                </p>
            </div>
            <div className="flex gap-4">
                <Button asChild>
                    <Link href="/admin/dashboard">Go to Admin Dashboard</Link>
                </Button>
                <Button variant="outline">Documentation</Button>
            </div>
        </section>
    )
}
