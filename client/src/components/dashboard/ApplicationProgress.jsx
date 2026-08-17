function ApplicationProgress({ currentStep = 3 }) {
  const steps = [
    "Application Submitted",
    "Document Verification",
    "Allotment Processing",
    "Allotment / Waiting List",
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">

      {/* Header */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800">
          Application Progress
        </h3>

        <p className="text-sm text-gray-500 mt-1">
          Track the progress of your current housing application.
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-start">

        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const completed = stepNumber <= currentStep;
          const isLast = index === steps.length - 1;

          return (
            <div
              key={step}
              className="flex-1 flex flex-col items-center relative"
            >

              {/* Line */}
              {!isLast && (
                <div
                  className={`absolute top-4 left-1/2 w-full h-0.5 ${
                    stepNumber < currentStep
                      ? "bg-blue-600"
                      : "bg-gray-200"
                  }`}
                ></div>
              )}

              {/* Circle */}
              <div
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  completed
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {stepNumber}
              </div>

              {/* Step Name */}
              <p
                className={`text-xs sm:text-sm text-center mt-3 max-w-28 ${
                  completed
                    ? "text-blue-600 font-medium"
                    : "text-gray-500"
                }`}
              >
                {step}
              </p>

            </div>
          );
        })}

      </div>

    </div>
  );
}

export default ApplicationProgress;