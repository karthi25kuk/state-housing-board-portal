import { useNavigate } from "react-router-dom";
import { FaBuilding, FaBullseye, FaEye, FaArrowLeft } from "react-icons/fa";

function About() {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800">
            About the Portal
          </h2>

          <p className="text-gray-600 mt-4 max-w-3xl mx-auto">
            The State Housing Board Allotment Application & Waiting List Status
            Management Portal is designed to digitize the housing allotment
            process, making it transparent, efficient, and accessible for all
            eligible citizens.
          </p>
        </div>

        {/* Mission, Objective & Vision */}
        <div className="grid md:grid-cols-3 gap-8">

          {/* Mission */}
          <div className="bg-gray-50 rounded-xl p-8 shadow-sm hover:shadow-md transition">
            <div className="text-blue-600 text-3xl mb-4">
              <FaBuilding />
            </div>

            <h3 className="text-xl font-semibold mb-3">
              Our Mission
            </h3>

            <p className="text-gray-600">
              To provide a simple and secure online platform for housing
              applications, reducing paperwork and improving service delivery.
            </p>
          </div>

          {/* Objective */}
          <div className="bg-gray-50 rounded-xl p-8 shadow-sm hover:shadow-md transition">
            <div className="text-blue-600 text-3xl mb-4">
              <FaBullseye />
            </div>

            <h3 className="text-xl font-semibold mb-3">
              Our Objective
            </h3>

            <p className="text-gray-600">
              To ensure a transparent allotment process with real-time
              application tracking and efficient waiting list management.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-gray-50 rounded-xl p-8 shadow-sm hover:shadow-md transition">
            <div className="text-blue-600 text-3xl mb-4">
              <FaEye />
            </div>

            <h3 className="text-xl font-semibold mb-3">
              Our Vision
            </h3>

            <p className="text-gray-600">
              To enhance public services through digital transformation while
              providing fair and accessible housing opportunities.
            </p>
          </div>

        </div>

        {/* Terms & Conditions */}
        <div className="mt-16 bg-gray-50 rounded-xl p-8 shadow-sm">
          <h3 className="text-2xl font-bold text-gray-800 mb-5">
            Terms & Conditions
          </h3>

          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p>
              By using this portal, applicants agree to provide accurate,
              complete, and up-to-date information during registration and
              application submission.
            </p>

            <p>
              Applicants are responsible for ensuring that all submitted
              documents and information are genuine and valid. Providing
              incorrect or misleading information may result in rejection of
              the application.
            </p>

            <p>
              Eligibility for a housing scheme is determined based on the
              eligibility criteria defined by the State Housing Board. Submission
              of an application does not guarantee allotment of a house.
            </p>

            <p>
              Waiting list positions are determined according to the applicable
              ranking criteria. Applicants should regularly check the portal
              for application, waiting list, and allotment updates.
            </p>

            <p>
              The Housing Board reserves the right to verify submitted
              information, reject applications that do not satisfy the required
              conditions, and modify or withdraw schemes when necessary.
            </p>

            <p>
              Users are responsible for maintaining the confidentiality of
              their login credentials and for all activities performed through
              their account.
            </p>
          </div>
        </div>

        {/* Privacy Policy */}
        <div className="mt-8 bg-gray-50 rounded-xl p-8 shadow-sm">
          <h3 className="text-2xl font-bold text-gray-800 mb-5">
            Privacy Policy
          </h3>

          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p>
              This portal collects personal information required for
              registration, application processing, verification, waiting list
              management, and housing allotment.
            </p>

            <p>
              Information such as name, contact details, district, income
              information, and supporting documents may be collected when
              required for processing a housing application.
            </p>

            <p>
              Personal information and uploaded documents are used only for
              purposes related to housing scheme administration, application
              verification, waiting list management, and allotment processing.
            </p>

            <p>
              Appropriate technical and administrative measures are used to
              protect user information from unauthorized access, modification,
              disclosure, or misuse.
            </p>

            <p>
              Users should ensure that their account credentials are kept
              secure and should immediately report any suspected unauthorized
              access.
            </p>

            <p>
              Information may be accessed by authorized Housing Board personnel
              when necessary to process applications and perform official
              administrative activities.
            </p>

            <p>
              By using this portal, users acknowledge and agree to the collection
              and processing of their information for legitimate housing
              administration purposes.
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="flex justify-center mt-12">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            <FaArrowLeft />
            Back to Home
          </button>
        </div>

      </div>
    </section>
  );
}

export default About;