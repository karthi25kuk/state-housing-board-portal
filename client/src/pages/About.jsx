import { FaBuilding, FaBullseye, FaEye } from "react-icons/fa";

function About() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">

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

        <div className="grid md:grid-cols-3 gap-8">

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

      </div>
    </section>
  );
}

export default About;