import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

function FAQItem() {
  const faqs = [
    {
      question: "Who can apply for housing schemes?",
      answer:
        "Any eligible citizen who satisfies the criteria specified for a housing scheme can apply through the portal.",
    },
    {
      question: "Can I edit my application after submission?",
      answer:
        "Yes. You can edit your application until the application deadline. Once verification begins, editing is disabled.",
    },
    {
      question: "How can I track my application?",
      answer:
        "Log in to your account and visit the 'Track Application' page to view the latest application status.",
    },
    {
      question: "How do I check my waiting list status?",
      answer:
        "Navigate to the Waiting List section after logging in to view your current position and allotment updates.",
    },
    {
      question: "What documents are required?",
      answer:
        "Applicants should upload identity proof, address proof, income certificate, and any additional documents required by the selected housing scheme.",
    },
  ];

  const [open, setOpen] = useState(null);

  const toggleFAQ = (index) => {
    setOpen(open === index ? null : index);
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6">

        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800">
            Frequently Asked Questions
          </h2>

          <p className="text-gray-600 mt-3">
            Find answers to the most common questions about the housing portal.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow border"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center p-5 text-left"
              >
                <span className="font-semibold text-gray-800">
                  {faq.question}
                </span>

                {open === index ? (
                  <FaChevronUp className="text-blue-600" />
                ) : (
                  <FaChevronDown className="text-blue-600" />
                )}
              </button>

              {open === index && (
                <div className="px-5 pb-5 text-gray-600">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default FAQItem;