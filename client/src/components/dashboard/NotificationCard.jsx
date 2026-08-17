import {
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";

function NotificationCard({
  type = "info",
  title,
  message,
  date,
  isNew = false,
}) {
  const notificationStyles = {
    info: {
      icon: <FaInfoCircle />,
      iconStyle: "text-blue-600 bg-blue-50",
    },
    success: {
      icon: <FaCheckCircle />,
      iconStyle: "text-green-600 bg-green-50",
    },
    warning: {
      icon: <FaExclamationCircle />,
      iconStyle: "text-yellow-600 bg-yellow-50",
    },
  };

  const style = notificationStyles[type] || notificationStyles.info;

  return (
    <div className="flex items-start gap-4 p-4 border-b border-gray-100 last:border-b-0">

      {/* Icon */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${style.iconStyle}`}
      >
        {style.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">

        <div className="flex items-start justify-between gap-3">

          <h4 className="font-medium text-gray-800">
            {title}
          </h4>

          {isNew && (
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
              New
            </span>
          )}

        </div>

        <p className="text-sm text-gray-600 mt-1">
          {message}
        </p>

        <p className="text-xs text-gray-400 mt-2">
          {date}
        </p>

      </div>

    </div>
  );
}

export default NotificationCard;