import {
  FaHome,
  FaFileUpload,
  FaSearch,
  FaArrowRight,
} from "react-icons/fa";

function QuickServices() {
  const services = [
    {
      title: "Apply for Housing",
      description:
        "Submit your application online for available housing schemes quickly and securely.",
      icon: <FaHome size={30} />,
    },
    {
      title: "Upload Documents",
      description:
        "Upload Aadhaar, income certificate, and other required documents securely.",
      icon: <FaFileUpload size={30} />,
    },
    {
      title: "Track Application",
      description:
        "View the current status of your application and stay updated on every stage.",
      icon: <FaSearch size={30} />,
    },
  ];

  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-gray-800">
            Quick Services
          </h2>

          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Access our most frequently used services with a single click and
            complete your housing application process effortlessly.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden"
            >
              {/* Top */}
              <div className="bg-blue-600 text-white flex justify-center items-center h-28">
                {service.icon}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {service.title}
                </h3>

                <p className="text-gray-600 leading-relaxed mb-6">
                  {service.description}
                </p>

                <button className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800 transition">
                  Go to Service
                  <FaArrowRight />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default QuickServices;