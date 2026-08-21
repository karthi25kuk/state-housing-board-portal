const API_URL = "http://localhost:5000/api/schemes";

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

  return data.schemes;
};

export const getSchemeById = async (token, schemeId) => {
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