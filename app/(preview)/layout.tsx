import "./globals.css";
import { Metadata } from "next";
import { Toaster } from "sonner";
import { Suspense } from "react";
import { FaGithub, FaTwitter } from "react-icons/fa6";

export const metadata: Metadata = {
  metadataBase: new URL("https://lyrical.sh"),
  title: "Lyrical: Language Learning Through Reading",
  description:
    "Improve language learning through AI-generated interactive reading experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="font-inter flex flex-col items-center justify-center min-h-screen bg-[#F5F5F5] dark:bg-zinc-900 p-4 relative overflow-hidden">
          <div className="absolute -bottom-[2%] -right-[10%] h-40 w-40 lg:-top-[10%] lg:h-96 lg:w-96">
            <div className="relative bottom-0 left-0 h-full w-full rounded-full bg-gradient-to-b from-blue-400/30 to-red-600/30 blur-[70px] filter" />
          </div>
          <Toaster position="top-center" richColors />
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-screen">
                <div className="w-5 h-5 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            }
          >
            {children}
          </Suspense>
          <div className="absolute bottom-4 left-4 text-xs text-zinc-400 dark:text-zinc-300 flex items-center space-x-2">
            <span>Made with ♥ by Ragnor</span>
            <a
              href="https://github.com/ragnorc/lyrical"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-700 dark:hover:text-gray-300"
            >
              <FaGithub />
            </a>
            <a
              href="https://twitter.com/ragnorco"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-700 dark:hover:text-gray-300"
            >
              <FaTwitter />
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
