import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "StockNest | NestMart Inventory & Sales",
  description:
    "Smart inventory and sales management system for NestMart retail stores.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
