import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './globals.css';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Canteen Dashboard',
  description: 'Staff only canteen management dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
      </head>
      <body suppressHydrationWarning>
        <MantineProvider
          defaultColorScheme="dark"
          theme={{
            primaryColor: 'blue',
            fontFamily: "'DM Sans', sans-serif",
            defaultRadius: 'md',
            colors: {
              dark: [
                '#C1C2C5', '#A6A7AB', '#909296', '#5C5F66',
                '#373A40', '#2C2E33', '#25262B', '#1A1B1E',
                '#141517', '#101113',
              ],
            },
          }}
        >
          <Notifications position="top-right" />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}