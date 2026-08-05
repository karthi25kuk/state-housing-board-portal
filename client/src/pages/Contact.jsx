import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaClock,
} from "react-icons/fa";

function Contact() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800">
            Contact Us
          </h2>

          <p className="text-gray-600 mt-4">
            Need assistance? Reach out to our support team.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">

          {/* Contact Details */}

          <div className="bg-white rounded-xl shadow p-8">

            <h3 className="text-2xl font-semibold mb-6">
              Contact Information
            </h3>

            <div className="space-y-6">

              <div className="flex items-center gap-4">
                <FaMapMarkerAlt className="text-blue-600 text-xl" />
                <div>
                  <h4 className="font-semibold">Office Address</h4>
                  <p className="text-gray-600">
                    Tamil Nadu Housing Board,
                    Chennai, Tamil Nadu
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <FaPhoneAlt className="text-blue-600 text-xl" />
                <div>
                  <h4 className="font-semibold">Phone</h4>
                  <p className="text-gray-600">
                    +91 1800-123-4567
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <FaEnvelope className="text-blue-600 text-xl" />
                <div>
                  <h4 className="font-semibold">Email</h4>
                  <p className="text-gray-600">
                    support@housingboard.in
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <FaClock className="text-blue-600 text-xl" />
                <div>
                  <h4 className="font-semibold">Office Hours</h4>
                  <p className="text-gray-600">
                    Monday - Friday
                    <br />
                    9:30 AM - 5:30 PM
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* Contact Form */}

          <div className="bg-white rounded-xl shadow p-8">

            <h3 className="text-2xl font-semibold mb-6">
              Send a Message
            </h3>

            <form className="space-y-5">

              <input
                type="text"
                placeholder="Full Name"
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="email"
                placeholder="Email Address"
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="text"
                placeholder="Subject"
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <textarea
                rows="5"
                placeholder="Your Message"
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>

              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Send Message
              </button>

            </form>

          </div>

        </div>

      </div>
    </section>
  );
}

export default Contact;