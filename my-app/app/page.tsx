// app/page.tsx
"use client";
import { useState, useEffect, useRef } from 'react';
import { Mic, Square, Sparkles, User, Briefcase, Building, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function Home() {
  const [step, setStep] = useState(1); // 1=Setup, 2=Interview, 3=Feedback
  const [formData, setFormData] = useState({ name: '', job: '', company: '', desc: '' });
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [transcriptBuffer, setTranscriptBuffer] = useState(""); 
  const [feedback, setFeedback] = useState(null);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  
  const recognitionRef = useRef(null);

  // --- AUDIO SETUP ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true; 
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
             currentTranscript += event.results[i][0].transcript;
          }
          setTranscriptBuffer(currentTranscript);
        };
      }
    }
  }, []);

  // --- AUTO START ---
  useEffect(() => {
    if (step === 2 && messages.length === 0) {
      const introText = `Hello ${formData.name}. I see you are applying for the ${formData.job} position at ${formData.company}. That sounds exciting. Why don't you start by telling me a little about yourself?`;
      addMessage('ai', introText);
      speakText(introText);
    }
  }, [step]);

  // --- FUNCTIONS ---

  const speakText = (text) => {
    window.speechSynthesis.cancel();
    setIsAiSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsAiSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleMicToggle = () => {
    if (isRecording) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
      if (transcriptBuffer.trim().length > 0) {
        addMessage('user', transcriptBuffer);
        getAiResponse(transcriptBuffer);
        setTranscriptBuffer(""); 
      }
    } else {
      if (recognitionRef.current && !isAiSpeaking) {
        setTranscriptBuffer(""); 
        recognitionRef.current.start();
        setIsRecording(true);
      }
    }
  };

  const getAiResponse = async (userText) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: messages, newMessage: userText, jobDetails: formData })
      });
      const data = await response.json();
      addMessage('ai', data.reply);
      speakText(data.reply);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const addMessage = (role, text) => {
    setMessages(prev => [...prev, { role, text }]);
  };

  const endCall = async () => {
    // Stop audio
    window.speechSynthesis.cancel();
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsRecording(false);
    
    // Move to feedback loading state
    setStep(3);
    setIsLoadingFeedback(true);

    try {
        const response = await fetch('/api/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ history: messages, jobDetails: formData })
        });
        const data = await response.json();
        setFeedback(data);
    } catch (e) {
        console.error(e);
    } finally {
        setIsLoadingFeedback(false);
    }
  };

  // --- RENDERERS ---

  // STEP 1: FORM
  if (step === 1) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 font-sans">
        <div className="max-w-xl w-full bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-800">
          <h1 className="text-3xl font-bold text-center mb-2 flex items-center justify-center gap-2 text-blue-400">
            <Sparkles size={28} /> MockMate AI
          </h1>
          <div className="space-y-4 mt-6">
            <input placeholder="Your Name" className="w-full p-3 rounded bg-slate-800 border border-slate-700" onChange={e => setFormData({...formData, name: e.target.value})} />
            <input placeholder="Target Company" className="w-full p-3 rounded bg-slate-800 border border-slate-700" onChange={e => setFormData({...formData, company: e.target.value})} />
            <input placeholder="Job Role" className="w-full p-3 rounded bg-slate-800 border border-slate-700" onChange={e => setFormData({...formData, job: e.target.value})} />
            <textarea placeholder="Paste Job Description..." className="w-full p-3 rounded bg-slate-800 border border-slate-700 h-24" onChange={e => setFormData({...formData, desc: e.target.value})} />
            <button onClick={() => setStep(2)} className="w-full bg-blue-600 p-4 rounded font-bold hover:bg-blue-500 transition">Start Interview</button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 3: FEEDBACK DASHBOARD
  if (step === 3) {
    return (
        <div className="min-h-screen bg-slate-950 text-white p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold mb-6 text-center">Interview Performance Report</h2>
                
                {isLoadingFeedback ? (
                    <div className="flex flex-col items-center justify-center h-64 space-y-4">
                        <Loader2 className="animate-spin text-blue-500" size={48} />
                        <p className="text-slate-400">Analyzing your answers...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Score Card */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 text-center">
                                <p className="text-slate-400 mb-2">Overall Score</p>
                                <div className={`text-5xl font-bold ${feedback?.score > 70 ? 'text-green-500' : 'text-yellow-500'}`}>
                                    {feedback?.score}/100
                                </div>
                            </div>
                            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 text-center col-span-2 flex flex-col justify-center">
                                <p className="text-slate-400 mb-1">Final Verdict</p>
                                <div className="text-3xl font-bold text-white">{feedback?.verdict}</div>
                                <p className="text-sm text-slate-500 mt-2">{feedback?.feedback}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Strengths */}
                            <div className="bg-slate-900/50 p-6 rounded-xl border border-green-900/30">
                                <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                                    <CheckCircle size={20} /> Strengths
                                </h3>
                                <ul className="space-y-3">
                                    {feedback?.strengths?.map((s, i) => (
                                        <li key={i} className="flex gap-2 text-slate-300">
                                            <span className="text-green-500">•</span> {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Weaknesses */}
                            <div className="bg-slate-900/50 p-6 rounded-xl border border-red-900/30">
                                <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                                    <AlertCircle size={20} /> Areas for Improvement
                                </h3>
                                <ul className="space-y-3">
                                    {feedback?.weaknesses?.map((w, i) => (
                                        <li key={i} className="flex gap-2 text-slate-300">
                                            <span className="text-red-500">•</span> {w}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <button onClick={() => window.location.reload()} className="w-full bg-slate-800 hover:bg-slate-700 p-4 rounded-lg font-bold transition">
                            Start New Interview
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
  }

  // STEP 2: INTERVIEW (Default)
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      <header className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
        <span className="font-semibold text-slate-200 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> 
            {formData.job} Interview
        </span>
        <button onClick={endCall} className="bg-red-500/10 text-red-400 border border-red-500/50 px-4 py-2 rounded-lg text-sm hover:bg-red-500 hover:text-white transition">
            End Interview & Get Feedback
        </button>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 space-y-6 max-w-3xl mx-auto w-full pb-32">
        {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200'}`}>
                    {msg.text}
                </div>
            </div>
        ))}
        {isRecording && <div className="text-center text-slate-500 animate-pulse">{transcriptBuffer || "Listening..."}</div>}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-6 flex justify-center bg-gradient-to-t from-slate-950">
        <button onClick={handleMicToggle} disabled={isAiSpeaking} className={`p-6 rounded-full shadow-xl transition-all ${isRecording ? 'bg-red-500 scale-110' : 'bg-blue-600 hover:scale-105'} disabled:opacity-50 disabled:cursor-not-allowed`}>
            {isRecording ? <Square size={32} fill="white" /> : <Mic size={32} />}
        </button>
      </footer>
    </div>
  );
}