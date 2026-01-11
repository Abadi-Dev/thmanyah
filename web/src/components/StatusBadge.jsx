const statusColors = {
  published: 'bg-green-100 text-green-800',
  draft: 'bg-gray-100 text-gray-800',
  archived: 'bg-red-100 text-red-800',
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${
        statusColors[status] || statusColors.draft
      }`}
    >
      {status}
    </span>
  );
}
