import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDailyQuote } from '../utils/gemini';

const Landing = () => {
  const [quote, setQuote] = useState(null);
  const [hasFetched, setHasFetched] = useState(false); // track clean mount

  useEffect(() => {
    setQuote(null); // 🔁 clear any stale value immediately
    const fetchQuote = async () => {
      const newQuote = await getDailyQuote();
      setQuote(newQuote);
      setHasFetched(true);
    };
    fetchQuote();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center px-4">
      <div className="bg-white p-10 rounded-xl shadow-lg text-center max-w-xl w-full animate-fade-in">
        <h1 className="text-4xl font-bold text-purple-700 mb-4">
          Mental Health Journal 💜
        </h1>

        <p className="text-gray-600 mb-8 text-lg">
          Find a peaceful space to reflect on your thoughts, write with intention,
          and gently explore your emotions — one journal entry at a time.
        </p>

        {/* 🧠 Show nothing unless fresh quote has been fetched */}
        <div className="mb-6 min-h-[1.5rem]">
          {!hasFetched ? (
            <div className="animate-pulse text-sm text-gray-400 italic">
              Fetching a gentle reflection...
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic fade-in">{quote}</p>
          )}
        </div>

        <div className="flex justify-center gap-4">
          <Link to="/signup">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded transition font-medium shadow">
              🔥 Start Journaling
            </button>
          </Link>

          <Link to="/login">
            <button className="border border-purple-600 text-purple-600 hover:bg-purple-100 px-6 py-2 rounded transition font-medium">
              🔐 Login
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;