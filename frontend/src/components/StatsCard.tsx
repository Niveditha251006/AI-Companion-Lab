import "../styles/StatsCard.css";
interface StatsCardProps {
  icon: string;
  title: string;
  value: number;
}

function StatsCard({ icon, title, value }: StatsCardProps) {
  return (
    <div className="stat-card">
      <h3>
        {icon} {title}
      </h3>

      <p>{value}</p>
    </div>
  );
}

export default StatsCard;