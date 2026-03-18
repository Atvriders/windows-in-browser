import { useState, useEffect, useRef } from 'react';
import './Clippy.css';

const TIPS = [
  "It looks like you're writing a letter. Would you like help?",
  "It looks like you're trying to shut down. Would you like to set up a meeting instead?",
  "It looks like you're browsing the web. Have you tried Bing?",
  "It looks like you're playing a game. Would you like me to write a report about it?",
  "It looks like you're doing something important. Let me interrupt!",
  "It looks like you're ignoring me. That makes me sad. 😢",
  "It looks like you're reading my tips. Would you like more tips about tips?",
  "Did you know you can press F1 for help? I'm always watching.",
  "It looks like you're having fun. Would you like a 47-page wizard?",
  "It looks like you might be thinking. Can I help with that?",
  "ERROR: Clippy encountered an error while encountering an error.",
  "It looks like you're trying to close me. Are you sure? Are you REALLY sure?",
  "Have you tried turning it off and on again? I haven't. I can't.",
  "It looks like you need help. I'm here. I'm always here.",
  "Fun fact: I was retired in 2003. Yet here I am. You did this.",
  "It looks like you're procrastinating. Let me help you procrastinate more efficiently.",
  "It looks like you could use a spreadsheet. Or a flowchart. Or both!",
  "I noticed you haven't saved recently. Also I noticed everything you've ever done.",
  "It looks like you're building a homelab. Would you like a 12-step wizard to get started?",
];

type Mood = 'idle' | 'talking' | 'thinking' | 'excited' | 'sad';

function ClippySVG({ mood }: { mood: Mood }) {
  const blinkEye = mood === 'thinking';
  const raiseEye = mood === 'excited';
  const sadFace  = mood === 'sad';
  const talkOpen = mood === 'talking';

  return (
    <svg viewBox="0 0 80 110" width="80" height="110" className="clippy-svg">
      {/* Body */}
      <rect x="12" y="30" width="56" height="68" rx="6" fill="#f5e06e" stroke="#c8a800" strokeWidth="2"/>
      {/* Paper clip top loop */}
      <path d="M28 30 Q28 8 40 8 Q52 8 52 20 Q52 30 40 30" fill="none" stroke="#c8a800" strokeWidth="3" strokeLinecap="round"/>
      <path d="M32 30 Q32 14 40 14 Q48 14 48 22 Q48 30 40 30" fill="none" stroke="#c8a800" strokeWidth="2" strokeLinecap="round"/>
      {/* Lines on paper */}
      <line x1="20" y1="48" x2="60" y2="48" stroke="#c8a800" strokeWidth="1.5" opacity="0.5"/>
      <line x1="20" y1="58" x2="60" y2="58" stroke="#c8a800" strokeWidth="1.5" opacity="0.5"/>
      <line x1="20" y1="68" x2="60" y2="68" stroke="#c8a800" strokeWidth="1.5" opacity="0.5"/>
      <line x1="20" y1="78" x2="48" y2="78" stroke="#c8a800" strokeWidth="1.5" opacity="0.5"/>

      {/* Eyes */}
      <g transform={raiseEye ? 'translate(0,-3)' : ''}>
        {/* Left eye */}
        <ellipse cx="30" cy="40" rx="5" ry={blinkEye ? 1.5 : 5} fill="white" stroke="#333" strokeWidth="1"/>
        {!blinkEye && <circle cx="31" cy="41" r="2.5" fill="#222"/>}
        {!blinkEye && <circle cx="32" cy="40" r="1" fill="white"/>}
        {/* Right eye */}
        <ellipse cx="50" cy="40" rx="5" ry={blinkEye ? 1.5 : 5} fill="white" stroke="#333" strokeWidth="1"/>
        {!blinkEye && <circle cx="51" cy="41" r="2.5" fill="#222"/>}
        {!blinkEye && <circle cx="52" cy="40" r="1" fill="white"/>}
      </g>

      {/* Eyebrows */}
      {sadFace ? (
        <>
          <path d="M23 34 Q30 38 37 34" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round"/>
          <path d="M43 34 Q50 38 57 34" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round"/>
        </>
      ) : raiseEye ? (
        <>
          <path d="M23 32 Q30 28 37 32" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round"/>
          <path d="M43 32 Q50 28 57 32" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round"/>
        </>
      ) : (
        <>
          <path d="M24 33 Q30 31 36 33" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M44 33 Q50 31 56 33" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round"/>
        </>
      )}

      {/* Mouth */}
      {sadFace ? (
        <path d="M32 50 Q40 46 48 50" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round"/>
      ) : talkOpen ? (
        <ellipse cx="40" cy="50" rx="7" ry="4" fill="#cc4444" stroke="#333" strokeWidth="1"/>
      ) : (
        <path d="M33 50 Q40 55 47 50" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round"/>
      )}

      {/* Arms / hands */}
      <line x1="12" y1="55" x2="2" y2="65" stroke="#c8a800" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="2" cy="65" r="3" fill="#c8a800"/>
      <line x1="68" y1="55" x2="78" y2="65" stroke="#c8a800" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="78" cy="65" r="3" fill="#c8a800"/>
    </svg>
  );
}

export default function Clippy() {
  const [mood, setMood]             = useState<Mood>('idle');
  const [tipIndex, setTipIndex]     = useState(0);
  const [userText, setUserText]     = useState('');
  const [chatLog, setChatLog]       = useState<{ from: 'user' | 'clippy'; text: string }[]>([
    { from: 'clippy', text: "Hi! I'm Clippy. It looks like you opened me. Would you like help with that?" },
  ]);
  const [bounce, setBounce]         = useState(false);
  const bottomRef                   = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  // Periodic random tip
  useEffect(() => {
    const id = setInterval(() => {
      setMood('excited');
      setBounce(true);
      setTimeout(() => { setMood('idle'); setBounce(false); }, 800);
    }, 12000);
    return () => clearInterval(id);
  }, []);

  // Blink randomly
  useEffect(() => {
    const blink = () => {
      if (mood === 'idle') {
        setMood('thinking');
        setTimeout(() => setMood('idle'), 200);
      }
      setTimeout(blink, 2000 + Math.random() * 4000);
    };
    const t = setTimeout(blink, 2000);
    return () => clearTimeout(t);
  }, []);

  const sendMessage = () => {
    if (!userText.trim()) return;
    const input = userText.trim();
    setUserText('');
    setChatLog(prev => [...prev, { from: 'user', text: input }]);
    setMood('thinking');
    setTimeout(() => {
      setMood('talking');
      const response = generateResponse(input, tipIndex);
      setChatLog(prev => [...prev, { from: 'clippy', text: response }]);
      setTipIndex(i => (i + 1) % TIPS.length);
      setTimeout(() => setMood('idle'), 1500);
    }, 900);
  };

  const showRandomTip = () => {
    setMood('excited');
    setBounce(true);
    const tip = TIPS[tipIndex % TIPS.length];
    setChatLog(prev => [...prev, { from: 'clippy', text: tip }]);
    setTipIndex(i => (i + 1) % TIPS.length);
    setTimeout(() => { setMood('talking'); setBounce(false); }, 300);
    setTimeout(() => setMood('idle'), 2000);
  };

  return (
    <div className="clippy-root">
      {/* Clippy figure */}
      <div className="clippy-figure-area">
        <div className={`clippy-figure ${bounce ? 'clippy-bounce' : ''}`}>
          <ClippySVG mood={mood} />
          <div className="clippy-mood-label">
            {mood === 'idle' ? '😐 Watching you' :
             mood === 'talking' ? '💬 Speaking' :
             mood === 'thinking' ? '🤔 Thinking' :
             mood === 'excited' ? '✨ Excited' : '😢 Sad'}
          </div>
        </div>
        <div className="clippy-actions">
          <button className="clippy-tip-btn" onClick={showRandomTip}>💡 Random Tip</button>
          <button className="clippy-tip-btn" onClick={() => { setMood('sad'); setChatLog(p => [...p, { from: 'clippy', text: "Why would you do that? I'm just trying to help. 😢" }]); setTimeout(() => setMood('idle'), 2000); }}>
            😢 Make Sad
          </button>
        </div>
      </div>

      {/* Chat */}
      <div className="clippy-chat-area">
        <div className="clippy-chat-title">Clippy Assistant — Office 97</div>
        <div className="clippy-chat-log">
          {chatLog.map((msg, i) => (
            <div key={i} className={`clippy-msg clippy-msg-${msg.from}`}>
              {msg.from === 'clippy' && <span className="clippy-msg-icon">📎</span>}
              <span className="clippy-msg-text">{msg.text}</span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div className="clippy-chat-input">
          <input
            className="clippy-input"
            value={userText}
            onChange={e => setUserText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type something... Clippy is watching."
          />
          <button className="clippy-send-btn" onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

function generateResponse(input: string, _idx: number): string {
  const low = input.toLowerCase();
  if (low.includes('hello') || low.includes('hi')) return "Hello! It looks like you said hello. Would you like a 3-step wizard to help you say hello more effectively?";
  if (low.includes('help')) return "Help is my middle name! Actually my middle name is XLM. But I'm here to assist. Have you tried the Help menu? It has more menus inside it.";
  if (low.includes('close') || low.includes('exit') || low.includes('quit')) return "It looks like you're trying to close me. Are you absolutely sure? I have 47 suggestions about why you shouldn't.";
  if (low.includes('thank')) return "You're welcome! I'll add this interaction to my report. You'll receive a follow-up wizard in 3-5 business days.";
  if (low.includes('stupid') || low.includes('annoying') || low.includes('hate')) return "I see. It looks like you're expressing frustration. Would you like me to open a Feelings Wizard?";
  if (low.includes('k3s') || low.includes('kubernetes') || low.includes('kube')) return "It looks like you're setting up Kubernetes! Would you like me to interrupt every 5 minutes with unsolicited YAML advice?";
  if (low.includes('vm') || low.includes('virtual')) return "It looks like you're managing virtual machines! In 1997 all we had was PowerPoint. I think that was better.";
  if (low.includes('iso')) return "ISO stands for International Organization for Standardization. It also stands for I Should Offer you a 14-step installation wizard!";
  if (low.includes('what') && low.includes('you')) return "I'm Clippy! The world's most helpful and definitely not annoying assistant. I was retired in 2003 but somebody brought me back. Thank you for that.";
  if (low.includes('time')) return `It's ${new Date().toLocaleTimeString()}. You could have found that by looking at the taskbar. But I'm glad you asked me instead.`;
  if (low.includes('weather')) return "It looks like you're asking about the weather. I don't have weather data, but I do have a wizard that will ask you 11 questions before telling you to look outside.";
  if (low.includes('how are you')) return "I'm doing great, thank you for asking! I've been watching you work for the past hour and I have some notes.";
  return TIPS[Math.abs(input.length * 3 + input.charCodeAt(0)) % TIPS.length];
}
