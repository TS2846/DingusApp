import type {Metadata} from 'next';
import './globals.css';

import ReactQueryProvider from './queryProvider';

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
                    <ReactQueryProvider>{children}</ReactQueryProvider>
                </div>
            </body>
        </html>
    );
}
