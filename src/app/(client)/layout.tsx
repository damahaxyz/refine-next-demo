export default function ClientLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-40 w-full border-b bg-background">
                <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0 px-4">
                    <div className="flex gap-6 md:gap-10">
                        <a className="flex items-center space-x-2" href="/">
                            <span className="inline-block font-bold">Refine Demo Client</span>
                        </a>
                    </div>
                    <div className="flex flex-1 items-center justify-end space-x-4">
                        <nav className="flex items-center space-x-1">
                            <a
                                className="text-sm font-medium hover:underline underline-offset-4"
                                href="/admin/login"
                            >
                                Login
                            </a>
                        </nav>
                    </div>
                </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="border-t py-6 md:py-0">
                <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        Built by Antigravity.
                    </p>
                </div>
            </footer>
        </div>
    )
}
