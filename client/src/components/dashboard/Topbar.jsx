import { FaSearch, FaBell, FaUserCircle } from "react-icons/fa";

function Topbar() {

  // Get logged-in user from localStorage
  const storedUser = localStorage.getItem("user");

  let user = {};

  try {
    user = storedUser
      ? JSON.parse(storedUser)
      : {};
  } catch (error) {
    console.error("User data error:", error);
  }

  const userName =
    user?.name ||
    user?.fullName ||
    "User";

  const userRole =
    user?.role || "Applicant";

  // Make role look cleaner
  const displayRole =
    userRole.charAt(0).toUpperCase() +
    userRole.slice(1).toLowerCase();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">

      <div className="flex items-center justify-between gap-6">

        {/* Page Title */}
        <div>

          <h2 className="text-xl font-semibold text-gray-800">
            Dashboard
          </h2>

          <p className="text-sm text-gray-500">
            Welcome back! Here's an overview of your activities.
          </p>

        </div>


        {/* Right Section */}
        <div className="flex items-center gap-5">


          {/* Search */}
          <div className="hidden md:flex items-center border border-gray-200 rounded-lg px-3 py-2">

            <FaSearch className="text-gray-400 mr-2" />

            <input
              type="text"
              placeholder="Search..."
              className="w-40 outline-none text-sm text-gray-700"
            />

          </div>


          {/* Notification */}
          <button
            className="relative text-gray-500 hover:text-blue-600 transition"
            title="Notifications"
          >

            <FaBell size={20} />

            {/* Notification count */}
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
              3
            </span>

          </button>


          {/* Profile */}
          <div className="flex items-center gap-2">

            <FaUserCircle
              size={32}
              className="text-gray-400"
            />

            <div className="hidden sm:block">

              <p className="text-sm font-medium text-gray-800">
                {userName}
              </p>

              <p className="text-xs text-gray-500">
                {displayRole}
              </p>

            </div>

          </div>

        </div>

      </div>

    </header>
  );
}

export default Topbar;