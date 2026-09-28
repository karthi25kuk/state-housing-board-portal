const API_URL = "http://localhost:5000/api/schemes";

// ==========================================
// GET OPEN / AVAILABLE HOUSING SCHEMES
// ==========================================

export const getOpenSchemes = async (token) => {
  const response = await fetch(`${API_URL}/open`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch housing schemes."
    );
  }

  return data.schemes || [];
};

// ==========================================
// GET SINGLE HOUSING SCHEME
// ==========================================

export const getSchemeById = async (token, schemeId) => {
  if (!schemeId) {
    throw new Error("Scheme ID is required.");
  }

  const response = await fetch(`${API_URL}/${schemeId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch housing scheme."
    );
  }

  return data.scheme;
};