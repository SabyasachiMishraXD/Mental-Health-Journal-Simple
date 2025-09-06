import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { analyzeJournal } from '../utils/gemini';

const Journal = () => {
  const [prompt, setPrompt] = useState('');
  const [entry, setEntry] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [loadingPrompt, setLoadingPrompt] = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);

  const navigate = useNavigate();

  // 🧠 Fetch last prompt or use default
  useEffect(() => {
    const fetchLastPrompt = async () => {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("User not logged in");

        const q = query(
          collection(db, 'users', user.uid, 'journals'),
          orderBy('timestamp', 'desc'),
          limit(1)
        );

        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const lastPrompt = snapshot.docs[0].data().prompt;
          setPrompt(lastPrompt);
        } else {
          setPrompt("How are you feeling right now?");
        }
      } catch (err) {
        console.error("Error fetching last prompt:", err.message);
        setPrompt("How are you feeling right now?");
      } finally {
        setLoadingPrompt(false);
      }
    };

    fetchLastPrompt();
  }, []);

  // ✍️ Handle journal submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingAI(true);
    setAiResponse(null);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not logged in");

      const { mood, emoji, feedback, prompt: nextPrompt } = await analyzeJournal(entry);

      await addDoc(collection(db, 'users', user.uid, 'journals'), {
        content: entry,
        prompt,
        mood,
        emoji,
        feedback,
        timestamp: serverTimestamp(),
      });

      setAiResponse({ mood, emoji, feedback });
      setPrompt(nextPrompt);
      setEntry('');
      toast.success('Journal submitted successfully 💜');
    } catch (err) {
      console.error('Submit error:', err);
      toast.error('Failed to submit journal. Please try again.');
    } finally {
      setLoadingAI(false);
    }
  };

  // 🚪 Handle logout
  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err.message);
      toast.error('Failed to log out.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex flex-col items-center justify-center px-4 py-8">
      
      {/* 🔐 Logout Button - top right of card */}
      <div className="w-full max-w-2xl flex justify-end mb-2">
        <button
          onClick={handleLogout}
          className="bg-red-100 text-red-600 px-4 py-1 rounded-md text-sm font-medium hover:bg-red-200 transition cursor-pointer"
        >
          Logout
        </button>
      </div>

      <div className="bg-white w-full max-w-2xl p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">
          Today's reflection, just for you 💜
        </h2>

        {loadingPrompt ? (
          <div className="flex flex-col items-center justify-center mb-6">
            <span className="animate-spin h-6 w-6 border-t-2 border-purple-600 rounded-full mb-2"></span>
            <p className="text-purple-600 text-sm italic">Loading your reflection...</p>
          </div>
        ) : (
          <p className="text-gray-700 text-center mb-6 italic">"{prompt}"</p>
        )}

        <form onSubmit={handleSubmit}>
          <textarea
            rows="6"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder="Write your journal entry here..."
            className="w-full p-4 border rounded-lg resize-none overflow-y-auto focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />

          <button
            type="submit"
            disabled={loadingAI}
            className={`mt-4 w-full py-2 rounded text-white font-semibold shadow transition ${
              loadingAI ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 active:scale-95'
            }`}
          >
            {loadingAI ? 'Analyzing your journal...' : 'Submit Journal'}
          </button>
        </form>

        {aiResponse && (
          <div className="mt-6 bg-purple-50 p-4 rounded text-sm shadow-inner">
            <p><strong>Mood:</strong> {aiResponse.emoji} {aiResponse.mood}</p>
            <p><strong>AI Feedback:</strong> {aiResponse.feedback}</p>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/history')}
            className="text-sm text-blue-600 hover:underline"
          >
            View Journal History
          </button>
        </div>
      </div>
    </div>
  );
};

export default Journal;