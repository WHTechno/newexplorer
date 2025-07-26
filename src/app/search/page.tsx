"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Layout from "@/components/Layout";

export default function SearchFallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-4xl font-bold text-gray-800 mb-4">404</div>
        <div className="text-lg text-gray-600 mb-2">Pencarian tidak ditemukan</div>
        {query && (
          <div className="text-sm text-gray-500 mb-4">
            Query: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{query}</span>
          </div>
        )}
        <button
          onClick={() => router.push("/")}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Kembali ke Dashboard
        </button>
      </div>
    </Layout>
  );
} 