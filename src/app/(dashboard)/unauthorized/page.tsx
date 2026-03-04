"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Unauthorized</h1>
        <p className="mb-6">You do not have permission to view this page.</p>
        <Link href="/logout">
          <button className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition">
            Sign Out
          </button>
        </Link>
      </div>
    </div>
  );
}
