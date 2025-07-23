import { useEffect } from "react";
import "./WelcomePopup.css";

interface WelcomePopupProps {
  onClose: () => void;
}

const WelcomePopup = ({ onClose }: WelcomePopupProps) => {
  useEffect(() => {
    // Auto-close popup after 3 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h2>🎉 Welcome Back!</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="popup-body">
          <p>Bereit für dein nächstes Workout?</p>
          <p>Lass uns gemeinsam deine Fitnessziele erreichen! 💪</p>
        </div>
        <div className="popup-footer">
          <button className="start-button" onClick={onClose}>
            Los geht's! 🚀
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePopup;
