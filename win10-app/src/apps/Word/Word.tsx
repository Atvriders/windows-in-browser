import { useState, useRef, useEffect } from 'react';
import { useFileSystemStore } from '../../store/useFileSystemStore';
import FilePicker from '../../components/FilePicker/FilePicker';
import './Word.css';

interface Props { fileId?: string; }

export default function Word({ fileId }: Props) {
  const { driver } = useFileSystemStore();
  const [showOpen, setShowOpen] = useState(false);
  const [activeFileId, setActiveFileId] = useState(fileId);
  const editorRef = useRef<HTMLDivElement>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [fontSize, setFontSize] = useState('12');
  const [fontFamily, setFontFamily] = useState('Calibri');
  const [statusMsg, setStatusMsg] = useState('');
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    if (activeFileId && driver && editorRef.current) {
      editorRef.current.innerHTML = driver.readFile(activeFileId).replace(/\n/g, '<br>');
    }
  }, [activeFileId, driver]);

  const openFromFS = (nodeId: string) => {
    if (driver && editorRef.current) {
      editorRef.current.innerHTML = driver.readFile(nodeId).replace(/\n/g, '<br>');
      setActiveFileId(nodeId);
      setIsDirty(false);
      setShowOpen(false);
    }
  };

  const exec = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  };

  const save = () => {
    if (fileId && driver && editorRef.current) {
      driver.writeFile(fileId, editorRef.current.innerText);
      setIsDirty(false);
      setStatusMsg('Saved');
      setTimeout(() => setStatusMsg(''), 2000);
    }
  };

  const handleInput = () => {
    setIsDirty(true);
    const text = editorRef.current?.innerText ?? '';
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 's') { e.preventDefault(); save(); }
  };

  return (
    <div className="word">
      <div className="word-ribbon">
        <div className="word-ribbon-group">
          <select className="word-select" value={fontFamily} onChange={e => { setFontFamily(e.target.value); exec('fontName', e.target.value); }}>
            {['Calibri','Arial','Times New Roman','Georgia','Verdana','Courier New'].map(f => <option key={f}>{f}</option>)}
          </select>
          <select className="word-select word-select-size" value={fontSize} onChange={e => { setFontSize(e.target.value); exec('fontSize', e.target.value); }}>
            {['8','9','10','11','12','14','16','18','20','24','28','36','48','72'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="word-ribbon-sep" />
        <div className="word-ribbon-group">
          <button className="word-btn word-bold" onClick={() => exec('bold')} title="Bold"><b>B</b></button>
          <button className="word-btn word-italic" onClick={() => exec('italic')} title="Italic"><i>I</i></button>
          <button className="word-btn word-underline" onClick={() => exec('underline')} title="Underline"><u>U</u></button>
          <button className="word-btn" onClick={() => exec('strikeThrough')} title="Strikethrough"><s>S</s></button>
        </div>
        <div className="word-ribbon-sep" />
        <div className="word-ribbon-group">
          <button className="word-btn" onClick={() => exec('justifyLeft')} title="Align Left">≡</button>
          <button className="word-btn" onClick={() => exec('justifyCenter')} title="Center">≡</button>
          <button className="word-btn" onClick={() => exec('justifyRight')} title="Align Right">≡</button>
        </div>
        <div className="word-ribbon-sep" />
        <div className="word-ribbon-group">
          <button className="word-btn" onClick={() => exec('insertUnorderedList')} title="Bullets">• List</button>
          <button className="word-btn" onClick={() => exec('insertOrderedList')} title="Numbered">1. List</button>
        </div>
        <div className="word-ribbon-sep" />
        <div className="word-ribbon-group">
          <button className="word-save-btn" onClick={() => setShowOpen(true)}>📂 Open</button>
          {isDirty && <span className="word-dirty">●</span>}
          {activeFileId && <button className="word-save-btn" onClick={save}>💾 Save</button>}
          {statusMsg && <span className="word-status-msg">{statusMsg}</span>}
        </div>
      </div>

      <div className="word-page-area">
        <div className="word-page">
          <div
            ref={editorRef}
            className="word-editor"
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            data-placeholder="Start typing..."
          />
        </div>
      </div>

      {showOpen && (
        <FilePicker
          title="Open Document"
          accept={['text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
          onSelect={(id) => openFromFS(id)}
          onClose={() => setShowOpen(false)}
        />
      )}

      <div className="word-statusbar">
        <span>Words: {wordCount}</span>
        <span>{fontFamily} {fontSize}pt</span>
      </div>
    </div>
  );
}
