import type { Metadata, ReactNode } from 'next';

export const metadata: Metadata = {
  title: 'Influencer Review Platform',
  description: 'Closed platform for authenticated influencer reviews',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
