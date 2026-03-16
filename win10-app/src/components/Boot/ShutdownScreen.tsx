import './ShutdownScreen.css';

interface Props { message: string; }

export default function ShutdownScreen({ message }: Props) {
  return (
    <div className="shutdown-screen">
      <div className="shutdown-logo">
        <div className="boot-logo-grid">
          <div className="boot-tile red" />
          <div className="boot-tile green" />
          <div className="boot-tile blue" />
          <div className="boot-tile yellow" />
        </div>
      </div>
      <p className="shutdown-msg">{message}</p>
    </div>
  );
}
