import { Link } from "react-router-dom";
import { FaHome, FaSearch } from "react-icons/fa";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <p className="text-6xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          404
        </p>
        <h1 className="mt-3 text-xl font-bold text-gray-800">
          Iyi paji ntabonetse
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Ibyo ushaka ntibibonetse cyangwa byimuwe ahandi.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            <FaHome /> Ahabanza
          </Link>
          <Link
            to="/events-public"
            className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 border border-blue-200 px-5 py-3 rounded-xl font-medium hover:bg-blue-50 transition-colors"
          >
            <FaSearch /> Ibyabaye
          </Link>
        </div>
      </div>
    </div>
  );
}
