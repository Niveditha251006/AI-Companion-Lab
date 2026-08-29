import "../styles/WelcomeBanner.css";

type WelcomeBannerProps = {
  name: string;
};

function WelcomeBanner({ name }: WelcomeBannerProps) {
  return (
    <div className="welcome-banner">
      <h1>👋 Welcome back, {name}!</h1>
      <p>Ready to continue your AI learning journey?</p>
    </div>
  );
}

export default WelcomeBanner;