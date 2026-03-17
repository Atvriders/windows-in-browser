import { useState, useEffect } from 'react';
import { useFileSystemStore } from '../../store/useFileSystemStore';
import FilePicker from '../../components/FilePicker/FilePicker';
import './Notepad.css';

interface Props { fileId?: string; initialContent?: string; }

export default function Notepad({ fileId, initialContent }: Props) {
  const { driver } = useFileSystemStore();
  const [showOpen, setShowOpen] = useState(false);
  const [activeFileId, setActiveFileId] = useState(fileId);
  const [content, setContent] = useState(initialContent ?? '');
  const [isDirty, setIsDirty] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    if (activeFileId && driver) {
      const text = driver.readFile(activeFileId);
      setContent(text);
      setIsDirty(false);
    }
  }, [activeFileId, driver]);

  const openFromFS = (nodeId: string) => {
    if (driver) {
      setContent(driver.readFile(nodeId));
      setActiveFileId(nodeId);
      setIsDirty(false);
      setShowOpen(false);
    }
  };

  const save = () => {
    if (activeFileId && driver) {
      driver.writeFile(activeFileId, content);
      setIsDirty(false);
      setStatusMsg('Saved');
      setTimeout(() => setStatusMsg(''), 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 's') { e.preventDefault(); save(); }
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = e.target as HTMLTextAreaElement;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const newContent = content.substring(0, start) + '    ' + content.substring(end);
      setContent(newContent);
      setTimeout(() => { el.selectionStart = el.selectionEnd = start + 4; }, 0);
    }
  };

  const lineCount = content.split('\n').length;
  const charCount = content.length;

  return (
    <div className="notepad">
      <div className="notepad-menubar">
        <div className="np-menu-group">
          <button className="np-menu-btn" onClick={() => setShowOpen(true)}>📂 Open</button>
          <button className="np-menu-btn">Edit</button>
          <button className="np-menu-btn" onClick={() => setWordWrap(w => !w)}>
            Format {wordWrap ? '✓' : ''} Wrap
          </button>
        </div>
        <div className="np-save-area">
          {isDirty && <span className="np-dirty">●</span>}
          {activeFileId && <button className="np-save-btn" onClick={save}>💾 Save (Ctrl+S)</button>}
          {statusMsg && <span className="np-status-msg">{statusMsg}</span>}
        </div>
      </div>
      <textarea
        className="notepad-editor"
        value={content}
        onChange={e => { setContent(e.target.value); setIsDirty(true); }}
        onKeyDown={handleKeyDown}
        style={{ whiteSpace: wordWrap ? 'pre-wrap' : 'pre', overflowX: wordWrap ? 'hidden' : 'auto' }}
        spellCheck={false}
        autoFocus
      />
      {showOpen && (
        <FilePicker
          title="Open File"
          accept={['text/plain']}
          onSelect={(id) => openFromFS(id)}
          onClose={() => setShowOpen(false)}
        />
      )}

      <div className="notepad-statusbar">
        <span>Ln {lineCount}, Col 1</span>
        <span>{charCount} characters</span>
        <span>UTF-8</span>
        <span>{wordWrap ? 'Word wrap: On' : 'Word wrap: Off'}</span>
      </div>
    </div>
  );
}
