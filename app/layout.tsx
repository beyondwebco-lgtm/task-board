import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TaskBoard - Team Task Management Dashboard',
  description: 'Clean, modern task assignment web application for team members with real-time updates and PostgreSQL persistence.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="app-container">{children}</div>
      </body>
    </html>
  );
}
