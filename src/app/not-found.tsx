import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <html lang="en">
      <body className="flex items-center justify-center min-h-screen bg-slate-50 font-sans p-6 text-slate-800 antialiased">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-100 shadow-xl flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-6">
            <span className="text-lg font-bold">404</span>
          </div>

          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-150 text-slate-655 uppercase tracking-widest">
            Not Found
          </span>

          <h2 className="text-xl font-black text-slate-900 tracking-tight mt-4">
            Page Not Found
          </h2>
          
          <p className="text-xs font-semibold text-slate-400 mt-2 leading-relaxed">
            The page you are looking for does not exist or has been moved.
          </p>

          <div className="w-full border-t border-slate-100 my-6 pt-6">
            <Link
              href="/en"
              className="w-full inline-block bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-2xl font-bold text-xs transition-colors text-center shadow-md hover:shadow-emerald-100"
            >
              Go to Homepage
            </Link>
          </div>

          <span className="text-[10px] font-bold text-slate-400">
            Powered by ReviewBoost
          </span>
        </div>
      </body>
    </html>
  );
}
