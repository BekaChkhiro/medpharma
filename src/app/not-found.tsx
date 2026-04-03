/**
 * Global Not Found Page
 * Displayed when the route doesn't match any locale
 * Styled to match the site design with bilingual content
 */

import Link from 'next/link';

export default function GlobalNotFound() {
  return (
    <html lang="ka" className="light" style={{ colorScheme: 'light' }}>
      <body className="min-h-screen bg-[#FDFBF7] text-slate-800 font-sans antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#FDFBF7] to-[#F5F0E8] px-4">
          <div className="text-center">
            {/* 404 Number */}
            <span className="text-[10rem] sm:text-[12rem] font-black leading-none text-[#2563eb]/15 select-none block">
              404
            </span>

            {/* Text - Georgian */}
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              გვერდი ვერ მოიძებნა
            </h1>
            <p className="text-slate-500 mb-1 max-w-md mx-auto">
              სამწუხაროდ, თქვენ მიერ მოძებნილი გვერდი არ არსებობს.
            </p>

            {/* Text - English */}
            <p className="text-slate-400 mb-10 max-w-md mx-auto text-sm">
              The page you are looking for does not exist.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/ka"
                className="inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 bg-[#df2b1b] text-white hover:bg-[#c42418] shadow-sm hover:shadow-md h-12 px-7 text-base rounded-xl min-w-[200px]"
              >
                მთავარი გვერდი
              </Link>
              <Link
                href="/en"
                className="inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 bg-[#FDFBF7] text-slate-800 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 h-12 px-7 text-base rounded-xl min-w-[200px]"
              >
                Home Page
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
