import { Inter } from "next/font/google";
import { QueryProvider } from "@/providers/QueryProvider";
import { TinybaseProvider } from "@/providers/TinybaseProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            <TinybaseProvider>
              <main className="w-[80%] mx-auto">{children}</main>
            </TinybaseProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
