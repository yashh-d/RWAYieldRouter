import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "xStocks - The Future of Tokenized Assets",
  description: "Buy tokenized stocks and lend on Kamino.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
