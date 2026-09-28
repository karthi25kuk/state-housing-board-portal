import { Link, useLocation } from "react-router-dom";

import {
  FaHome,
  FaBuilding,
  FaFileAlt,
  FaClipboardList,
  FaBell,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";

function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const normalizedRole = (user?.role || "APPLICANT").toUpperCase();

  // ==========================================
  // ROLE BASED MENU
  // ==========================================

  let menuItems = [];

  if (normalizedRole === "APPLICANT") {
    menuItems = [
      {
        name: "Dashboard",
        path: "/applicant",
        icon: <FaHome />,
      },
      {
        name: "Housing Schemes",
        path: "/applicant/schemes",
        icon: <FaBuilding />,
      },
      {
        name: "My Applications",
        path: "/applicant/applications",
        icon: <FaClipboardList />,
      },
      {
        name: "Waiting List",
        path: "/applicant/waiting-list",
        icon: <FaFileAlt />,
      },
    ];
  } else if (normalizedRole === "OFFICER") {
    menuItems = [
      {
        name: "Dashboard",
        path: "/officer",
        icon: <FaHome />,
      },
      {
        name: "Housing Schemes",
        path: "/officer/schemes",
        icon: <FaBuilding />,
      },
      {
        name: "Applications",
        path: "/officer/applications",
        icon: <FaClipboardList />,
      },
    ];
  } else if (normalizedRole === "ADMIN") {
    menuItems = [
      {
        name: "Dashboard",
        path: "/admin",
        icon: <FaHome />,
      },
      {
        name: "Housing Schemes",
        path: "/admin/schemes/create",
        icon: <FaBuilding />,
      },
      {
        name: "Create Officer",
        path: "/admin/officers/create",
        icon: <FaUser />,
      },
    ];
  }

  // ==========================================
  // ACCOUNT MENU
  // ==========================================

  const accountItems = [
    {
      name: "Notifications",
      path: "/notifications",
      icon: <FaBell />,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <FaUser />,
    },
  ];

  // ==========================================
  // ACTIVE LINK
  // ==========================================

  const isActive = (path) => {
    if (path === "/admin/schemes/create") {
      return location.pathname === "/admin/schemes/create";
    }

    return location.pathname === path;
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    logout();
  };

  // ==========================================
  // ROLE LABEL
  // ==========================================

  const portalName =
    normalizedRole === "APPLICANT"
      ? "Applicant Portal"
      : normalizedRole === "OFFICER"
      ? "District Officer Portal"
      : "Administration Portal";

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 shrink-0">

      {/* =====================================
          LOGO
      ===================================== */}

      <div className="px-6 py-5 border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-600">
          Housing Board
        </h1>

        <p className="text-xs text-gray-500 mt-1">
          {portalName}
        </p>
      </div>

      {/* =====================================
          NAVIGATION
      ===================================== */}

      <nav className="p-4">

        <p className="text-xs font-semibold text-gray-400 uppercase px-3 mb-3">
          Main Menu
        </p>

        <div className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition ${
                isActive(item.path)
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
              }`}
            >
              {item.icon}

              <span>{item.name}</span>
            </Link>
          ))}
        </div>

        {/* =================================
            ACCOUNT
        ================================= */}

        <p className="text-xs font-semibold text-gray-400 uppercase px-3 mt-8 mb-3">
          Account
        </p>

        <div className="space-y-1">
          {accountItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition ${
                isActive(item.path)
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
              }`}
            >
              {item.icon}

              <span>{item.name}</span>
            </Link>
          ))}
        </div>

        {/* =================================
            LOGOUT
        ================================= */}

        <div className="border-t border-gray-200 mt-8 pt-4">
          <button
            onClick={handleLogout}
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