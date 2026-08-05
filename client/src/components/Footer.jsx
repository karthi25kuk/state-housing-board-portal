import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">

      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-10">

        {/* About */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            State Housing Board
          </h2>

          <p className="text-sm leading-6">
            A digital platform that enables citizens to apply for
            government housing schemes, upload documents, and
            track application status with complete transparency.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Quick Links
          </h3>

          <ul className="space-y-2">
            <li>
              <a href="/" className="hover:text-white">
                Home
              </a>
            </li>

            <li>
              <a href="/about" className="hover:text-white">
                About
              </a>
            </li>

            <li>
              <a href="/contact" className="hover:text-white">
                Contact
              </a>
            </li>

            <li>
              <a href="/login" className="hover:text-white">
                Login
              </a>
            </li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Services
          </h3>

          <ul className="space-y-2">
            <li>Housing Schemes</li>
            <li>Apply Online</li>
            <li>Track Application</li>
            <li>Waiting List</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Contact Us
          </h3>

          <div className="space-y-4">

            <div className="flex items-center gap-3">
              <FaMapMarkerAlt />
              <span>Chennai, Tamil Nadu</span>
            </div>

            <div className="flex items-center gap-3">
              <FaPhoneAlt />
              <span>1800-123-4567</span>
            </div>

            <div className="flex items-center gap-3">
              <FaEnvelope />
              <span>support@housingboard.in</span>
            </div>

          </div>
        </div>

      </div>

      {/* Bottom */}

      <div className="border-t border-gray-700">

        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between items-center text-sm">

          <p>
            © 2026 State Housing Board. All Rights Reserved.
          </p>

          <div className="flex gap-6 mt-3 md:mt-0">
            <a href="/">Privacy Policy</a>
            <a href="/">Terms & Conditions</a>
            <a href="/">Help</a>
          </div>

        </div>

      </div>

    </footer>
  );
}

export default Footer;