'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const errorMessages: Record<string, string> = {
  "400": "Bad Request",
  "401": "Unauthorized",
  "402": "Payment Required",
  "403": "Forbidden",
  "404": "Not Found",
  "405": "Method Not Allowed",
  "406": "Not Acceptable",
  "407": "Proxy Authentication Required",
  "408": "Request Timeout",
  "409": "Conflict",
  "410": "Gone",
  "411": "Length Required",
  "412": "Precondition Failed",
  "413": "Payload Too Large",
  "414": "URI Too Long",
  "415": "Unsupported Media Type",
  "416": "Range Not Satisfiable",
  "417": "Expectation Failed",
  "418": "I'm a Teapot",
  "421": "Misdirected Request",
  "422": "Unprocessable Entity",
  "423": "Locked",
  "424": "Failed Dependency",
  "425": "Too Early",
  "426": "Upgrade Required",
  "428": "Precondition Required",
  "429": "Too Many Requests",
  "431": "Request Header Fields Too Large",
  "451": "Unavailable For Legal Reasons",
  "500": "Internal Server Error",
  "501": "Not Implemented",
  "502": "Bad Gateway",
  "503": "Service Unavailable",
  "504": "Gateway Timeout",
  "505": "HTTP Version Not Supported",
  "506": "Variant Also Negotiates",
  "507": "Insufficient Storage",
  "508": "Loop Detected",
  "510": "Not Extended",
  "511": "Network Authentication Required",
  "520": "Unknown Error",
  "521": "Web Server Down",
  "522": "Connection Timed Out",
  "523": "Origin Unreachable",
  "524": "Timeout Occurred",
  "525": "SSL Handshake Failed",
  "526": "Invalid SSL Certificate",
  "527": "Railgun Error"
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code') || 'Error';
  const message = errorMessages[code] || "An unexpected error occurred.";

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-page relative overflow-hidden min-h-[70vh]">
      {/* Decorative background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-brand opacity-20 blur-[100px]"></div>

      <div className="relative z-10 flex flex-col items-center justify-center">
        <h1 className="text-[120px] md:text-[200px] font-extrabold text-neutral-200 dark:text-neutral-800/60 tracking-tighter leading-none select-none">
          {code}
        </h1>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <h2 className="text-2xl md:text-4xl font-bold text-neutral-900 dark:text-white bg-white/60 dark:bg-neutral-900/60 px-6 py-2 rounded-xl backdrop-blur-md border border-neutral-200/50 dark:border-neutral-700/50 shadow-sm">
            {message}
          </h2>
        </div>
      </div>
      
      <p className="text-neutral-500 dark:text-neutral-400 mt-12 mb-8 max-w-md mx-auto relative z-10 text-lg">
        An error occurred while processing your request. If you believe this is a mistake, please contact support.
      </p>
      
      <div className="relative z-10 flex gap-4">
        <Link 
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 rounded-full font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition-opacity"
        >
          Return Home
        </Link>
        <Link 
          href="/channels"
          className="inline-flex items-center justify-center px-6 py-3 rounded-full font-medium bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors border border-neutral-200 dark:border-neutral-700"
        >
          Browse Channels
        </Link>
      </div>
    </div>
  );
}

export default function CustomErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center text-neutral-500 min-h-[70vh]">
        Loading error details...
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
