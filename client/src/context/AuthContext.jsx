import {
  createContext,
  useContext,
  useState,
} from "react";

const AuthContext = createContext();

// ======================================================
// AUTH PROVIDER
// ======================================================

export function AuthProvider({ children }) {
  // ====================================================
  // USER
  // ====================================================

  const [user, setUser] = useState(() => {
    try {
      const storedUser =
        localStorage.getItem("user");

      return storedUser
        ? JSON.parse(storedUser)
        : null;
    } catch (error) {
      console.error(
        "Failed to load stored user:",
        error
      );

      localStorage.removeItem("user");

      return null;
    }
  });

  // ====================================================
  // TOKEN
  // ====================================================

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token");
  });

  // ====================================================
  // LOGIN
  // ====================================================
  //
  // Backend response:
  //
  // {
  //   token,
  //   user: {
  //     id,
  //     name,
  //     email,
  //     role,
  //     district,
  //     housingStatus
  //   }
  // }
  //
  // ====================================================

  const login = (userData, userToken) => {
    if (!userData || !userToken) {
      return;
    }

    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );

    localStorage.setItem(
      "token",
      userToken
    );

    setUser(userData);
    setToken(userToken);
  };

  // ====================================================
  // UPDATE USER
  // ====================================================
  //
  // Useful when user information changes without
  // requiring another login.
  //
  // Example:
  //
  // housingStatus:
  // NOT_ALLOTTED -> ALLOTTED
  //
  // ====================================================

  const updateUser = (updatedData) => {
    setUser((currentUser) => {
      if (!currentUser) {
        return updatedData;
      }

      const updatedUser = {
        ...currentUser,
        ...updatedData,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      return updatedUser;
    });
  };

  // ====================================================
  // LOGOUT
  // ====================================================

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    setUser(null);
    setToken(null);
  };

  // ====================================================
  // AUTHENTICATION STATUS
  // ====================================================

  const isAuthenticated =
    !!token && !!user;

  // ====================================================
  // CONTEXT
  // ====================================================

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ======================================================
// USE AUTH
// ======================================================

export function useAuth() {
  return useContext(AuthContext);
}