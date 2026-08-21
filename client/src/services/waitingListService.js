const API_URL = "http://localhost:5000/api/waiting-list";

// ==========================================
// GET MY WAITING LIST ENTRIES
// ==========================================

export const getMyWaitingLists = async (token) => {
  const response = await fetch(`${API_URL}/my`, {
    method: "GET",

    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch waiting list."
    );
  }

  return data.waitingLists;
};