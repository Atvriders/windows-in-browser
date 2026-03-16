import { useState } from 'react';
import './Outlook.css';

interface Email { id: number; from: string; subject: string; preview: string; body: string; time: string; read: boolean; }

const INBOX: Email[] = [
  { id: 1, from: 'Microsoft Team', subject: 'Welcome to Outlook!', preview: 'Thank you for using Microsoft Outlook...', body: 'Thank you for using Microsoft Outlook!\n\nThis is your inbox. You can read, compose, and manage emails here.\n\nBest regards,\nThe Microsoft Team', time: '9:41 AM', read: false },
  { id: 2, from: 'IT Department', subject: 'System Maintenance Tonight', preview: 'Please save your work before 10pm...', body: 'Hello,\n\nPlease be advised that scheduled system maintenance will occur tonight from 10:00 PM to 2:00 AM.\n\nPlease save all your work before 10 PM.\n\nThank you,\nIT Department', time: 'Yesterday', read: true },
  { id: 3, from: 'HR Team', subject: 'Q1 Review Scheduled', preview: 'Your Q1 performance review is scheduled for...', body: 'Hi,\n\nYour Q1 performance review has been scheduled for next Friday at 2:00 PM in Conference Room B.\n\nPlease prepare a self-assessment beforehand.\n\nBest,\nHR Team', time: 'Mon', read: true },
  { id: 4, from: 'no-reply@github.com', subject: 'New activity on windows-in-browser', preview: 'There is new activity on your repository...', body: 'You have new activity on windows-in-browser.\n\nSomeone starred your repository!\n\nVisit GitHub to view the activity.', time: 'Sun', read: true },
];

const FOLDERS = [
  { name: 'Inbox', icon: '📥', count: 1 },
  { name: 'Sent', icon: '📤', count: 0 },
  { name: 'Drafts', icon: '📝', count: 2 },
  { name: 'Junk', icon: '🗑', count: 0 },
  { name: 'Deleted', icon: '❌', count: 0 },
];

export default function Outlook() {
  const [emails, setEmails] = useState(INBOX);
  const [selected, setSelected] = useState<Email | null>(emails[0]);
  const [composing, setComposing] = useState(false);
  const [folder, setFolder] = useState('Inbox');

  const select = (email: Email) => {
    setSelected(email);
    setEmails(e => e.map(m => m.id === email.id ? { ...m, read: true } : m));
    setComposing(false);
  };

  return (
    <div className="outlook">
      <div className="outlook-sidebar">
        <button className="outlook-compose-btn" onClick={() => setComposing(true)}>✉ New Email</button>
        {FOLDERS.map(f => (
          <button key={f.name} className={`outlook-folder ${folder === f.name ? 'active' : ''}`} onClick={() => setFolder(f.name)}>
            <span>{f.icon} {f.name}</span>
            {f.count > 0 && <span className="outlook-badge">{f.count}</span>}
          </button>
        ))}
      </div>

      <div className="outlook-list">
        {emails.map(email => (
          <div key={email.id} className={`outlook-email-item ${selected?.id === email.id ? 'selected' : ''} ${!email.read ? 'unread' : ''}`} onClick={() => select(email)}>
            <div className="outlook-email-from">{email.from}</div>
            <div className="outlook-email-subject">{email.subject}</div>
            <div className="outlook-email-preview">{email.preview}</div>
            <div className="outlook-email-time">{email.time}</div>
          </div>
        ))}
      </div>

      <div className="outlook-content">
        {composing ? (
          <div className="outlook-compose">
            <div className="outlook-compose-header">New Message</div>
            <div className="outlook-compose-field"><label>To:</label><input className="outlook-compose-input" /></div>
            <div className="outlook-compose-field"><label>Subject:</label><input className="outlook-compose-input" /></div>
            <textarea className="outlook-compose-body" placeholder="Write your message..." />
            <div className="outlook-compose-actions">
              <button className="outlook-send-btn">📤 Send</button>
              <button className="outlook-discard-btn" onClick={() => setComposing(false)}>Discard</button>
            </div>
          </div>
        ) : selected ? (
          <div className="outlook-reader">
            <div className="outlook-reader-subject">{selected.subject}</div>
            <div className="outlook-reader-meta">
              <span><b>From:</b> {selected.from}</span>
              <span className="outlook-reader-time">{selected.time}</span>
            </div>
            <div className="outlook-reader-body">{selected.body}</div>
            <div className="outlook-reader-actions">
              <button className="outlook-action-btn">↩ Reply</button>
              <button className="outlook-action-btn">↪ Forward</button>
              <button className="outlook-action-btn">🗑 Delete</button>
            </div>
          </div>
        ) : (
          <div className="outlook-empty">Select an email to read</div>
        )}
      </div>
    </div>
  );
}
