/**
 * Root Layout
 * Minimal wrapper - locale-specific layout handles HTML structure
 */

import './globals.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
