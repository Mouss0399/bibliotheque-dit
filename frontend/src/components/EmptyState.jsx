export function EmptyState({ icon, title, description }) {
  return (
    <div className="empty-state">
      {icon}
      <div className="empty-title">{title}</div>
      {description && <div className="empty-desc">{description}</div>}
    </div>
  );
}
