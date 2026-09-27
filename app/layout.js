import "./globals.css";

export const metadata = {
  title: "BotHub — Python Bot Hosting",
  description: "No-login Python Telegram bot deployment dashboard"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}