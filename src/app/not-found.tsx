/**
 * Global Not Found Page
 * Displayed when the route doesn't match any locale
 */

import Link from 'next/link';

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
          <div className="text-center">
            <h1 className="text-9xl font-bold text-gray-200">404</h1>
            <h2 className="mt-4 text-2xl font-semibold text-gray-900">
              Page Not Found
            </h2>
            <p className="mt-2 text-gray-600">
              The page you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link
              href="/"
              className="mt-8 inline-block rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
            >
              ← Go Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
