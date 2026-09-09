import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getSchemeById } from "../../services/schemeService";

function ApplyScheme() {
  const { schemeId } = useParams();
  const navigate = useNavigate();

  const [scheme, setScheme] = useState(null);

  // ==========================================
  // APPLICANT DETAILS
  // ==========================================

  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  // ==========================================
  // ADDRESS DETAILS
  // ==========================================

  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [pinCode, setPinCode] = useState("");

  // ==========================================
  // FAMILY / INCOME DETAILS
  // ==========================================

  const [familyMembers, setFamilyMembers] = useState("");
  const [annualIncome, setAnnualIncome] = useState("");
  const [incomeCategory, setIncomeCategory] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("");
  const [occupation, setOccupation] = useState("");

  // ==========================================
  // DOCUMENT DETAILS
  // ==========================================

  const [incomeCertificateUrl, setIncomeCertificateUrl] =
    useState("");

  const [aadhaarDocumentUrl, setAadhaarDocumentUrl] =
    useState("");

  const [addressProofUrl, setAddressProofUrl] =
    useState("");

  // ==========================================
  // STATE
  // ==========================================

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // FETCH SCHEME
  // ==========================================

  useEffect(() => {
    const fetchScheme = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          setError(
            "Your session has expired. Please login again."
          );
          return;
        }

        if (!schemeId) {
          setError("Invalid housing scheme.");
          return;
        }

        const data = await getSchemeById(token, schemeId);

        if (!data) {
          setError("Housing scheme not found.");
          return;
        }

        setScheme(data);
      } catch (error) {
        console.error("Fetch scheme error:", error);

        setError(
          error.message ||
            "Unable to load housing scheme."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchScheme();
  }, [schemeId]);

  // ==========================================
  // VALIDATE AADHAAR
  // ==========================================

  const validateAadhaar = () => {
    const cleaned = aadhaarNumber.replace(/\s/g, "");

    return /^\d{12}$/.test(cleaned);
  };

  // ==========================================
  // VALIDATE PIN CODE
  // ==========================================

  const validatePinCode = () => {
    return /^\d{6}$/.test(pinCode);
  };

  // ==========================================
  // VALIDATE MOBILE
  // ==========================================

  const validateMobile = () => {
    return /^[6-9]\d{9}$/.test(mobileNumber);
  };

  // ==========================================
  // SUBMIT APPLICATION
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");

    if (!token) {
      setError(
        "Your session has expired. Please login again."
      );
      return;
    }

    // ==========================================
    // REQUIRED FIELD VALIDATION
    // ==========================================

    if (
      !aadhaarNumber ||
      !dateOfBirth ||
      !gender ||
      !mobileNumber ||
      !address ||
      !district ||
      !state ||
      !pinCode ||
      !familyMembers ||
      !annualIncome ||
      !incomeCategory ||
      !employmentStatus ||
      !occupation
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    // ==========================================
    // AADHAAR VALIDATION
    // ==========================================

    if (!validateAadhaar()) {
      setError(
        "Aadhaar number must contain exactly 12 digits."
      );
      return;
    }

    // ==========================================
    // MOBILE VALIDATION
    // ==========================================

    if (!validateMobile()) {
      setError(
        "Please enter a valid 10-digit Indian mobile number."
      );
      return;
    }

    // ==========================================
    // PIN CODE VALIDATION
    // ==========================================

    if (!validatePinCode()) {
      setError("PIN code must contain exactly 6 digits.");
      return;
    }

    // ==========================================
    // FAMILY MEMBERS
    // ==========================================

    if (Number(familyMembers) < 1) {
      setError(
        "Family members must be at least 1."
      );
      return;
    }

    // ==========================================
    // INCOME
    // ==========================================

    if (Number(annualIncome) < 0) {
      setError(
        "Annual income cannot be negative."
      );
      return;
    }

    // ==========================================
    // SCHEME CHECK
    // ==========================================

    if (!scheme) {
      setError(
        "Housing scheme details are unavailable."
      );
      return;
    }

    if (scheme.status !== "OPEN") {
      setError(
        "Applications are currently not open for this scheme."
      );
      return;
    }

    if (
      scheme.availableUnits !== undefined &&
      Number(scheme.availableUnits) <= 0
    ) {
      setError(
        "No houses are currently available in this scheme."
      );
      return;
    }

    // ==========================================
    // SUBMIT
    // ==========================================

    try {
      setSubmitting(true);

      const response = await fetch(
        "http://localhost:5000/api/applications",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            // Scheme
            schemeId,

            // Applicant
            aadhaarNumber:
              aadhaarNumber.replace(/\s/g, ""),

            dateOfBirth,

            gender,

            mobileNumber,

            // Address
            address,

            district,

            state,

            pinCode,

            // Family / income
            familyMembers: Number(familyMembers),

            annualIncome: Number(annualIncome),

            incomeCategory,

            employmentStatus,

            occupation,

            // Documents
            incomeCertificateUrl,

            aadhaarDocumentUrl,

            addressProofUrl,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to submit housing application."
        );

        return;
      }

      setSuccess(
        data.message ||
          "Housing application submitted successfully."
      );

      // ==========================================
      // CLEAR FORM
      // ==========================================

      setAadhaarNumber("");
      setDateOfBirth("");
      setGender("");
      setMobileNumber("");

      setAddress("");
      setDistrict("");
      setState("");
      setPinCode("");

      setFamilyMembers("");
      setAnnualIncome("");
      setIncomeCategory("");
      setEmploymentStatus("");
      setOccupation("");

      setIncomeCertificateUrl("");
      setAadhaarDocumentUrl("");
      setAddressProofUrl("");

      // ==========================================
      // REDIRECT
      // ==========================================

      setTimeout(() => {
        navigate("/applicant/applications");
      }, 1500);

    } catch (error) {
      console.error(
        "Create application error:",
        error
      );

      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-600">
            Loading scheme details...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // SCHEME ERROR
  // ==========================================

  if (!scheme) {
    return (
      <section className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="max-w-2xl mx-auto">

          <Link
            to="/applicant/schemes"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            &larr; Back to Housing Schemes
          </Link>

          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-6 mt-6">
            {error || "Housing scheme not found."}
          </div>

        </div>
      </section>
    );
  }

  // ==========================================
  // MAIN PAGE
  // ==========================================

  return (
    <section className="min-h-screen bg-slate-50 py-10 px-4">

      <div className="max-w-4xl mx-auto">

        {/* BACK */}

        <Link
          to="/applicant/schemes"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          &larr; Back to Housing Schemes
        </Link>

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-5">

          <p className="text-sm text-blue-600 font-medium">
            Housing Application
          </p>

          <h1 className="text-2xl font-bold text-gray-800 mt-1">
            Apply for Housing Scheme
          </h1>

          <p className="text-gray-500 mt-2">
            Complete the following details to submit
            your application.
          </p>

        </div>

        {/* ==========================================
            SELECTED SCHEME
        ========================================== */}

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mt-5">

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

            <div>

              <p className="text-sm text-blue-600 font-medium">
                Selected Scheme
              </p>

              <h2 className="text-xl font-semibold text-gray-800 mt-1">
                {scheme.schemeName}
              </h2>

              <p className="text-sm text-gray-600 mt-1">
                {scheme.district}

                {scheme.location
                  ? ` · ${scheme.location}`
                  : ""}
              </p>

            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                scheme.status === "OPEN"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {scheme.status}
            </span>

          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-5">

            <div>
              <p className="text-xs text-gray-500">
                House Model
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {scheme.houseModel || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Price
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                ₹
                {scheme.price !== undefined
                  ? Number(
                      scheme.price
                    ).toLocaleString("en-IN")
                  : "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Available Units
              </p>

              <p
                className={`font-semibold mt-1 ${
                  Number(scheme.availableUnits) > 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {scheme.availableUnits ?? "-"}
              </p>
            </div>

          </div>

        </div>

        {/* ==========================================
            APPLICATION FORM
        ========================================== */}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-5"
        >

          {/* ==========================================
              PERSONAL INFORMATION
          ========================================== */}

          <div className="mb-8">

            <h2 className="text-lg font-semibold text-gray-800">
              Personal Information
            </h2>

            <p className="text-sm text-gray-500 mt-1 mb-5">
              Provide your official identification and
              personal details.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Aadhaar */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aadhaar Number *
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength="12"
                  value={aadhaarNumber}
                  onChange={(e) =>
                    setAadhaarNumber(
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  placeholder="Enter 12-digit Aadhaar number"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

              </div>

              {/* Date of Birth */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth *
                </label>

                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) =>
                    setDateOfBirth(e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

              </div>

              {/* Gender */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender *
                </label>

                <select
                  value={gender}
                  onChange={(e) =>
                    setGender(e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >

                  <option value="">
                    Select gender
                  </option>

                  <option value="MALE">
                    Male
                  </option>

                  <option value="FEMALE">
                    Female
                  </option>

                  <option value="OTHER">
                    Other
                  </option>

                </select>

              </div>

              {/* Mobile */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number *
                </label>

                <input
                  type="tel"
                  maxLength="10"
                  value={mobileNumber}
                  onChange={(e) =>
                    setMobileNumber(
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  placeholder="Enter 10-digit mobile number"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

              </div>

            </div>

          </div>

          {/* ==========================================
              ADDRESS
          ========================================== */}

          <div className="border-t border-gray-100 pt-6 mb-8">

            <h2 className="text-lg font-semibold text-gray-800">
              Address Information
            </h2>

            <p className="text-sm text-gray-500 mt-1 mb-5">
              Enter your current residential address.
            </p>

            {/* Address */}

            <div className="mb-5">

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Address *
              </label>

              <textarea
                rows="3"
                value={address}
                onChange={(e) =>
                  setAddress(e.target.value)
                }
                placeholder="Enter your complete residential address"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                required
              />

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* District */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  District *
                </label>

                <input
                  type="text"
                  value={district}
                  onChange={(e) =>
                    setDistrict(e.target.value)
                  }
                  placeholder="District"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

              </div>

              {/* State */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>

                <input
                  type="text"
                  value={state}
                  onChange={(e) =>
                    setState(e.target.value)
                  }
                  placeholder="State"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

              </div>

              {/* PIN */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PIN Code *
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength="6"
                  value={pinCode}
                  onChange={(e) =>
                    setPinCode(
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  placeholder="6-digit PIN"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

              </div>

            </div>

          </div>

          {/* ==========================================
              FAMILY AND INCOME
          ========================================== */}

          <div className="border-t border-gray-100 pt-6 mb-8">

            <h2 className="text-lg font-semibold text-gray-800">
              Family & Income Information
            </h2>

            <p className="text-sm text-gray-500 mt-1 mb-5">
              Provide information required for eligibility
              verification.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Family Members */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Family Members *
                </label>

                <input
                  type="number"
                  min="1"
                  value={familyMembers}
                  onChange={(e) =>
                    setFamilyMembers(e.target.value)
                  }
                  placeholder="Enter family members"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

              </div>

              {/* Annual Income */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Family Income *
                </label>

                <input
                  type="number"
                  min="0"
                  value={annualIncome}
                  onChange={(e) =>
                    setAnnualIncome(e.target.value)
                  }
                  placeholder="Enter annual income"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

              </div>

              {/* Income Category */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Income Category *
                </label>

                <select
                  value={incomeCategory}
                  onChange={(e) =>
                    setIncomeCategory(e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >

                  <option value="">
                    Select income category
                  </option>

                  <option value="EWS">
                    EWS
                  </option>

                  <option value="LIG">
                    LIG
                  </option>

                  <option value="MIG">
                    MIG
                  </option>

                  <option value="HIG">
                    HIG
                  </option>

                </select>

              </div>

              {/* Occupation */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Occupation *
                </label>

                <input
                  type="text"
                  value={occupation}
                  onChange={(e) =>
                    setOccupation(e.target.value)
                  }
                  placeholder="Enter occupation"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

              </div>

              {/* Employment */}

              <div className="md:col-span-2">

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employment Status *
                </label>

                <select
                  value={employmentStatus}
                  onChange={(e) =>
                    setEmploymentStatus(e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >

                  <option value="">
                    Select employment status
                  </option>

                  <option value="EMPLOYED">
                    Employed
                  </option>

                  <option value="SELF_EMPLOYED">
                    Self Employed
                  </option>

                  <option value="UNEMPLOYED">
                    Unemployed
                  </option>

                  <option value="RETIRED">
                    Retired
                  </option>

                  <option value="OTHER">
                    Other
                  </option>

                </select>

              </div>

            </div>

          </div>

          {/* ==========================================
              DOCUMENTS
          ========================================== */}

          <div className="border-t border-gray-100 pt-6 mb-8">

            <h2 className="text-lg font-semibold text-gray-800">
              Supporting Documents
            </h2>

            <p className="text-sm text-gray-500 mt-1 mb-5">
              Provide accessible document links for
              verification. Google Drive links can be used.
            </p>

            {/* Income Certificate */}

            <div className="mb-5">

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Income Certificate Link *
              </label>

              <input
                type="url"
                value={incomeCertificateUrl}
                onChange={(e) =>
                  setIncomeCertificateUrl(
                    e.target.value
                  )
                }
                placeholder="https://drive.google.com/..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

              <p className="text-xs text-gray-500 mt-1">
                Upload your income certificate to Google
                Drive and paste the shareable link here.
              </p>

            </div>

            {/* Aadhaar Document */}

            <div className="mb-5">

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aadhaar Document Link *
              </label>

              <input
                type="url"
                value={aadhaarDocumentUrl}
                onChange={(e) =>
                  setAadhaarDocumentUrl(
                    e.target.value
                  )
                }
                placeholder="https://drive.google.com/..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

            </div>

            {/* Address Proof */}

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Proof Link *
              </label>

              <input
                type="url"
                value={addressProofUrl}
                onChange={(e) =>
                  setAddressProofUrl(
                    e.target.value
                  )
                }
                placeholder="https://drive.google.com/..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

            </div>

          </div>

          {/* ==========================================
              ERROR
          ========================================== */}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-5 text-sm">
              {error}
            </div>
          )}

          {/* ==========================================
              SUCCESS
          ========================================== */}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 rounded-lg p-4 mb-5 text-sm">
              {success}
            </div>
          )}

          {/* ==========================================
              DECLARATION
          ========================================== */}

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">

            <p className="text-sm text-gray-600">
              I confirm that all information and documents
              provided in this application are true and
              correct. I understand that the Housing Board
              may verify my identity, income, address,
              employment and supporting documents before
              considering my application for allotment.
            </p>

          </div>

          {/* ==========================================
              SUBMIT
          ========================================== */}

          <button
            type="submit"
            disabled={
              submitting ||
              scheme.status !== "OPEN" ||
              Number(scheme.availableUnits) <= 0
            }
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {submitting
              ? "Submitting Application..."
              : scheme.status !== "OPEN"
              ? "Applications Closed"
              : Number(scheme.availableUnits) <= 0
              ? "No Houses Available"
              : "Submit Housing Application"}
          </button>

        </form>

      </div>

    </section>
  );
}

export default ApplyScheme;