import "../styles/DashboardCard.css";

type DashboardCardProps = {
  title: string;
  description: string;
  icon?: string;
  onClick?: () => void;
};

function DashboardCard({
  title,
  description,
  icon,
  onClick,
}: DashboardCardProps) {
  return (
    <div
      className={`dashboard-card ${onClick ? "clickable" : ""}`}
      onClick={onClick}
    >
      {icon && <div className="dashboard-card-icon">{icon}</div>}

      <h2>{title}</h2>

      <p>{description}</p>
    </div>
  );
}

export default DashboardCard;