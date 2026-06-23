function IncidentCard({ incident, onEdit, onDelete, currentUserId, isAdmin }) {
  return (
    <div
      className={`bg-slate-800/50 border-2 rounded-xl p-6 hover:shadow-lg transition-all ${
        incident.severity === "High"
          ? "border-red-500/50"
          : incident.severity === "Medium"
          ? "border-yellow-500/50"
          : "border-green-500/50"
      }`}
    >
      {/* Header with Title and Badges */}
      <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-white">{incident.title}</h3>
          <p className="text-slate-400 text-sm mt-1">
            Reported by <span className="font-semibold text-slate-300">{incident.user?.name}</span> on{" "}
            {new Date(incident.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <span
            className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap ${
              incident.severity === "High"
                ? "bg-red-500/20 text-red-300"
                : incident.severity === "Medium"
                ? "bg-yellow-500/20 text-yellow-300"
                : "bg-green-500/20 text-green-300"
            }`}
          >
            {incident.severity}
          </span>
          <span
            className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap ${
              incident.status === "Pending"
                ? "bg-orange-500/20 text-orange-300"
                : incident.status === "Verified"
                ? "bg-green-500/20 text-green-300"
                : "bg-blue-500/20 text-blue-300"
            }`}
          >
            {incident.status}
          </span>
        </div>
      </div>

      {/* Image */}
      {incident.image && (
        <img
          src={`http://localhost:5000/uploads/${incident.image}`}
          alt="Incident"
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
      )}

      {/* Description */}
      <p className="text-slate-300 mb-4 line-clamp-2">{incident.description}</p>

      {/* Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
        <div className="bg-slate-700/50 p-3 rounded-lg">
          <p className="text-slate-400">📍 Location</p>
          <p className="text-white font-semibold truncate">{incident.location}</p>
        </div>
        <div className="bg-slate-700/50 p-3 rounded-lg">
          <p className="text-slate-400">👤 Reporter</p>
          <p className="text-white font-semibold truncate">{incident.user?.name}</p>
        </div>
        <div className="bg-slate-700/50 p-3 rounded-lg">
          <p className="text-slate-400">📧 Email</p>
          <p className="text-white font-semibold text-xs truncate">{incident.user?.email}</p>
        </div>
        <div className="bg-slate-700/50 p-3 rounded-lg">
          <p className="text-slate-400">📅 Date</p>
          <p className="text-white font-semibold text-xs">
            {new Date(incident.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* AI Analysis */}
      {incident.aiAnalysis && (
        <div className="bg-slate-700/50 p-4 rounded-lg mb-4 border-l-4 border-blue-500">
          <h4 className="text-blue-300 font-bold mb-2 flex items-center gap-2">
            <span>🤖</span> AI Analysis
          </h4>
          <pre className="text-slate-300 text-xs whitespace-pre-wrap max-h-32 overflow-y-auto">
            {incident.aiAnalysis}
          </pre>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap">
        {currentUserId === incident.user?._id && (
          <>
            <button
              onClick={() => onEdit(incident)}
              className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors font-semibold text-sm"
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => onDelete(incident._id)}
              className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors font-semibold text-sm"
            >
              🗑️ Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default IncidentCard;