import "../styles/featurecard.css";
type FeatureCardProps = {
  title: string;
  description: string;
};

function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className="feature-card">
      <h3>{title}</h3>
      <p>{description}</p>
      <button>Explore</button>
    </div>
  );
}

export default FeatureCard;