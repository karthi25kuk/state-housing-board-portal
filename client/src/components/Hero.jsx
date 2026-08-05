import heroImage from "../assets/images/House1.png"; // Replace with your image

function Hero() {
  return (
    <section className="bg-slate-50 py-16">
      <div className="max-w-7xl mx-auto px-6 flex flex-col-reverse lg:flex-row items-center gap-12">

        {/* Left Content */}
        <div className="flex-1">
          <span className="text-blue-600 font-semibold">
            Tamil Nadu Housing Board
          </span>

          <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mt-3 leading-tight">
            Apply for Government Housing
            <br />
            <span className="text-blue-600">Online with Ease</span>
          </h1>

          <p className="text-gray-600 mt-6 leading-7">
            Apply for housing schemes, upload documents, track your
            application, and check waiting list status through a secure
            and transparent online portal.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
              Apply Now
            </button>

            <button className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition">
              Track Status
            </button>
          </div>
        </div>

        {/* Right Image */}
        <div className="flex-1 flex justify-center">
          <img
            src={heroImage}
            alt="Housing"
            className="w-full max-w-md"
          />
        </div>

      </div>
    </section>
  );
}

export default Hero;