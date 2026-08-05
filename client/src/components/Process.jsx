import {
  FaUserPlus,
  FaHome,
  FaFileUpload,
  FaClipboardCheck,
  FaCheckCircle,
  FaListOl,
} from "react-icons/fa";

function Process() {
  const steps = [
    {
      title: "Register",
      description: "Create your account using your personal information.",
      icon: <FaUserPlus size={28} />,
    },
    {
      title: "Choose Scheme",
      description:
        "Select a suitable housing scheme based on your eligibility.",
      icon: <FaHome size={28} />,
    },
    {
      title: "Submit Application",
      description:
        "Complete the application form and upload required documents.",
      icon: <FaFileUpload size={28} />,
    },
    {
      title: "Verification",
      description:
        "Housing Board officials verify your submitted information.",
      icon: <FaClipboardCheck size={28} />,
    },
    {
      title: "Allotment",
      description:
        "Eligible applications proceed through the allotment process.",
      icon: <FaCheckCircle size={28} />,
    },
    {
      title: "Track Status",
      description:
        "View your allotment result or waiting list status anytime.",
      icon: <FaListOl size={28} />,
    },
  ];

  return (
    <section className="bg-blue-50 py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-gray-800">
            Application Process
          </h2>

          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Complete your housing application in six simple steps through our
            secure and transparent online portal.
          </p>
        </div>

        {/* Steps */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative bg-white rounded-2xl p-8 shadow-md border border-gray-100 hover:-translate-y-2 hover:shadow-xl transition-all duration-300"
            >
              {/* Step Number */}
              <div className="absolute -top-5 right-5 bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg">
                {index + 1}
              </div>

              {/* Icon */}
              <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                {step.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Process;