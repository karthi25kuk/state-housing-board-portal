function Navbar() {
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
            SH
          </div>

          <div>
            <h1 className="text-xl font-bold text-gray-800">
              State Housing Board
            </h1>
            <p className="text-xs text-gray-500">
              Government of Tamil Nadu
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="hidden md:flex items-center gap-8 text-gray-700 font-medium">
          <a href="/" className="hover:text-blue-600 transition">
            Home
          </a>

          <a href="/schemes" className="hover:text-blue-600 transition">
            Schemes
          </a>

          <a href="/about" className="hover:text-blue-600 transition">
            About
          </a>

          <a href="/contact" className="hover:text-blue-600 transition">
            Contact
          </a>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <a
            href="/login"
            className="px-5 py-2 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 transition"
          >
            Login
          </a>

          <a
            href="/register"
            className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Register
          </a>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;