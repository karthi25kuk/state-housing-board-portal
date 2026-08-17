import {
  FaHome,
  FaBuilding,
  FaFileAlt,
  FaClipboardList,
  FaClock,
  FaBell,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";

function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200">

      {/* Logo / Title */}
      <div className="px-6 py-5 border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-600">
          Housing Board
        </h1>

        <p className="text-xs text-gray-500 mt-1">
          Applicant Portal
        </p>
      </div>

      {/* Navigation */}
      <nav className="p-4">

        <p className="text-xs font-semibold text-gray-400 uppercase px-3 mb-3">
          Main Menu
        </p>

        <div className="space-y-1">

          {/* Dashboard */}
          <a
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-3 rounded-lg bg-blue-50 text-blue-600 font-medium"
          >
            <FaHome />
            <span>Dashboard</span>
          </a>

          {/* Housing Schemes */}
          <a
            href="/schemes"
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition"
          >
            <FaBuilding />
            <span>Housing Schemes</span>
          </a>

          {/* Apply */}
          <a
            href="/apply"
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition"
          >
            <FaFileAlt />
            <span>Apply for Housing</span>
          </a>

          {/* Applications */}
          <a
            href="/applications"
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition"
          >
            <FaClipboardList />
            <span>My Applications</span>
          </a>

          {/* Waiting List */}
          <a
            href="/waiting-list"
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition"
          >
            <FaClock />
            <span>Waiting List</span>
          </a>

        </div>

        {/* Account */}
        <p className="text-xs font-semibold text-gray-400 uppercase px-3 mt-8 mb-3">
          Account
        </p>

        <div className="space-y-1">

          {/* Notifications */}
          <a
            href="/notifications"
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition"
          >
            <FaBell />
            <span>Notifications</span>
          </a>

          {/* Profile */}
          <a
            href="/profile"
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition"
          >
            <FaUser />
            <span>Profile</span>
          </a>

        </div>

        {/* Logout */}
        <div className="border-t border-gray-200 mt-8 pt-4">

          <button
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-500 hover:bg-red-50 transition"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>

        </div>

      </nav>
    </aside>
  );
}

export default Sidebar;