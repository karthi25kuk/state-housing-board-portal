function StatCard({ title, value, icon, description }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
      
      <div className="flex items-center justify-between">

        {/* Title */}
        <div>
          <p className="text-sm text-gray-500">
            {title}
          </p>

          <h3 className="text-2xl font-bold text-gray-800 mt-1">
            {value}
          </h3>
        </div>

        {/* Icon */}
        <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          {icon}
        </div>

      </div>

      {/* Description */}
      {description && (
        <p className="text-xs text-gray-500 mt-4">
          {description}
        </p>
      )}

    </div>
  );
}

export default StatCard;