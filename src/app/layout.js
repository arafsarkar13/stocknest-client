import "./globals.css";
import Providers from "./providers";
import AnimatedBackground from "@/components/AnimatedBackground";

export const metadata = {
  title: "StockNest | NestMart Inventory & Sales",
  description:
    "Smart inventory and sales management system for NestMart retail stores.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body>
        <Providers>
          <AnimatedBackground />
          <div className="relative z-10">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
