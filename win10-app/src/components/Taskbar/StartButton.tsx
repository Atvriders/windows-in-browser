import './StartButton.css';

interface Props { onClick: () => void; }

export default function StartButton({ onClick }: Props) {
  return (
    <button className="start-button" onClick={onClick} title="Start">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
        <rect x="0" y="0" width="8" height="8"/>
        <rect x="10" y="0" width="8" height="8"/>
        <rect x="0" y="10" width="8" height="8"/>
        <rect x="10" y="10" width="8" height="8"/>
      </svg>
    </button>
  );
}
