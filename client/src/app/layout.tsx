import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'MessageApp',
    description: 'Chat app created with Socket.io',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <div className="container flex flex-row mx-auto h-screen min-h-96">
                    {children}
                </div>
            </body>
        </html>
    );
}
