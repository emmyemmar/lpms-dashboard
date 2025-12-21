import "../styles/globals.css";

export const metadata = {
  title: "LPMS",
  description: "Liquity Position Monitoring System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
