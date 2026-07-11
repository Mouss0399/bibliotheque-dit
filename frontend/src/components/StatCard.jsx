export function StatCard({ icon, label, value, tone = "info" }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span className={`stat-icon badge-${tone}`} style={{ background: `var(--${tone}-soft)`, color: `var(--${tone})` }}>
          {icon}
        </span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
