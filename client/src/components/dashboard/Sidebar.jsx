import { Link, useLocation, useNavigate } from "react-router-dom";

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
  const location = useLocation();
  const navigate = useNavigate();

  // Get logged-in user
  const storedUser = localStorage.getItem("user");

  let user = {};

  try {
    user = storedUser
      ? JSON.parse(storedUser)
      : {};
  } catch (error) {
    console.error("User data error:", error);
  }

  const role =
    user?.role ||
    localStorage.getItem("role") ||
    "APPLICANT";

  const normalizedRole = role.toUpperCase();

  // ------------------------------------------
  // ROLE BASED MENU
  // ------------------------------------------

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
        icon: <FaClock />,
      },
    ];
  }

  else if (normalizedRole === "OFFICER") {
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
        name: "Create Scheme",
        path: "/officer/create-scheme",
        icon: <FaFileAlt />,
      },
      {
        name: "Applications",
        path: "/officer/applications",
        icon: <FaClipboardList />,
      },
      {
        name: "Waiting List",
        path: "/officer/waiting-list",
        icon: <FaClock />,
      },
    ];
  }

  else if (normalizedRole === "ADMIN") {
    menuItems = [
      {
        name: "Dashboard",
        path: "/admin",
        icon: <FaHome />,
      },
      {
        name: "Housing Schemes",
        path: "/admin/schemes",
        icon: <FaBuilding />,
      },
      {
        name: "Applications",
        path: "/admin/applications",
        icon: <FaClipboardList />,
      },
      {
        name: "Users",
        path: "/admin/users",
        icon: <FaUser />,
      },
      {
        name: "Reports",
        path: "/admin/reports",
        icon: <FaFileAlt />,
      },
    ];
  }

  // ------------------------------------------
  // ACCOUNT MENU
  // ------------------------------------------

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

  // ------------------------------------------
  // ACTIVE LINK
  // ------------------------------------------

  const isActive = (path) => {
    return location.pathname === path;
  };

  // ------------------------------------------
  // LOGOUT
  // ------------------------------------------

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    navigate("/login");
  };

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
          {normalizedRole === "APPLICANT"
            ? "Applicant Portal"
            : normalizedRole === "OFFICER"
            ? "District Officer Portal"
            : "Administration Portal"}
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

              <span>
                {item.name}
              </span>

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

              <span>
                {item.name}
              </span>

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

            <span>
              Logout
            </span>

          </button>

        </div>

      </nav>

    </aside>
  );
}

export default Sidebar;