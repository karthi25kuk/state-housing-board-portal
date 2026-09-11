const API_URL = "http://localhost:5000/api/applications";

// ==========================================
// CREATE / SUBMIT APPLICATION
// ==========================================

export const createApplication = async (token, applicationData) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(applicationData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to submit application.");
  }

  return data;
};

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

export const getMyApplicationById = async (token, applicationId) => {
  const response = await fetch(`${API_URL}/${applicationId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch application."
    );
  }

  return data.application;
};