function StatCard({ title, value, icon, description }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            {value}
          </p>
          {description && (
            <p className="text-xs text-gray-500 mt-2">
              {description}
            </p>
          )}
        </div>
        <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default StatCard;