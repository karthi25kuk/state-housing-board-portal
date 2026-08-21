const API_URL = "http://localhost:5000/api/applications";

// ==========================================
// GET LOGGED-IN APPLICANT'S APPLICATIONS
// ==========================================

export const getMyApplications = async (token) => {
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
      data.message || "Failed to fetch applications."
    );
  }

  return data.applications;
};

// ==========================================
// GET SINGLE APPLICATION
// ==========================================

export const getMyApplicationById = async (
  token,
  applicationId
) => {
  const response = await fetch(
    `${API_URL}/${applicationId}`,
    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch application."
    );
  }

  return data.application;
};