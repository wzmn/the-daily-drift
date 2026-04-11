// app/layout.tsx
import "./globals.css"; // Ensure your Tailwind styles are imported
import { Inter } from "next/font/google";
import { Toaster } from 'sonner';
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "The Daily Draft",
  description: "Automated News Engine",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        {children}
        <Toaster theme="dark" richColors closeButton />
      </body>
    </html>
  );
}