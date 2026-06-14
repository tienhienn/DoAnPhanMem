/**
 * Badge component - hiển thị badge trạng thái với màu sắc theo type
 *
 * Props:
 * - type: "registered" | "attended" | "full" | "available"
 * - children hoặc label: nội dung hiển thị
 */

const BADGE_STYLES = {
  registered: "bg-green-100 text-green-800 border border-green-200",
  attended: "bg-blue-100 text-blue-800 border border-blue-200",
  full: "bg-red-100 text-red-800 border border-red-200",
  available: "bg-lime-100 text-lime-700 border border-lime-200",
};

export default function Badge({ type, children, label }) {
  const styles = BADGE_STYLES[type] ?? "bg-gray-100 text-gray-700 border border-gray-200";
  const content = children ?? label;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles}`}
    >
      {content}
    </span>
  );
}
