/**
 * CTSVEstablishedClubsPanel - Danh sách CLB đã thành lập (dạng lưới card)
 */

import { useNavigate } from "react-router-dom";
import { FiUsers } from "react-icons/fi";
import CTSVClubCard from "./CTSVClubCard";

export default function CTSVEstablishedClubsPanel({ clubs, loading, onRefresh }) {
  const navigate = useNavigate();

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-cyan-50">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FiUsers className="text-indigo-600" />
            Câu lạc bộ đã thành lập
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {loading ? "Đang tải..." : `${clubs.length} câu lạc bộ đang hoạt động`}
          </p>
        </div>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
          >
            Làm mới
          </button>
        )}
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"
                role="status"
                aria-label="Đang tải..."
              />
              <p className="text-sm text-slate-500">Đang tải danh sách câu lạc bộ...</p>
            </div>
          </div>
        ) : clubs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <FiUsers className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-base font-semibold text-slate-700">
              Chưa có câu lạc bộ nào được thành lập
            </p>
            <p className="mt-1 text-sm text-slate-400">
              CLB mới sẽ xuất hiện tại đây sau khi được phê duyệt
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {clubs.map((club) => {
              const maCLB = (club.MaCLB || "").trim();
              return (
                <CTSVClubCard
                  key={maCLB}
                  club={club}
                  onClick={() => navigate(`/ctsv/clubs/${maCLB}`)}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
