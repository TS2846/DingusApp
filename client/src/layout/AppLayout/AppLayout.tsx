export default function AppLayout({children}: {children: React.ReactNode}) {
    return (
        <main className="w-full grid grid-rows-10 bg-secondary">
            {children}
        </main>
    );
}
