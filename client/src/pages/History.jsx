import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const History = () => {
  const [journals, setJournals] = useState([]);
  const [filteredJournals, setFilteredJournals] = useState([]);
  const [selectedMood, setSelectedMood] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJournals = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/login');
          return;
        }

        const journalsRef = collection(db, 'users', user.uid, 'journals');
        const q = query(journalsRef, orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);

        const entries = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setJournals(entries);
        setFilteredJournals(entries); // initial
      } catch (err) {
        console.error('Error fetching journal history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJournals();
  }, [navigate]);

  // 🔍 Filter whenever mood changes
  useEffect(() => {
    if (selectedMood === 'all') {
      setFilteredJournals(journals);
    } else {
      const filtered = journals.filter(entry => entry.mood?.toLowerCase() === selectedMood);
      setFilteredJournals(filtered);
    }
  }, [selectedMood, journals]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 px-4 py-10 flex flex-col items-center">
      <div className="max-w-3xl w-full bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-purple-700 mb-6 text-center">Your Journal History 📖</h2>

        {/* 🎯 Mood Filter Dropdown */}
        <div className="mb-6 text-center">
          <label htmlFor="moodFilter" className="mr-2 text-gray-700 font-medium">Filter by Mood:</label>
          <select
            id="moodFilter"
            value={selectedMood}
            onChange={(e) => setSelectedMood(e.target.value)}
            className="border rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="all">All</option>
            <option value="happy">Happy</option>
            <option value="sad">Sad</option>
            <option value="anxious">Anxious</option>
            <option value="grateful">Grateful</option>
            <option value="excited">Excited</option>
            <option value="angry">Angry</option>
            <option value="tired">Tired</option>
            {/* Add more if needed */}
          </select>
        </div>

        {loading ? (
          <p className="text-center text-purple-600 italic">Loading your entries...</p>
        ) : filteredJournals.length === 0 ? (
          <p className="text-center text-gray-500">No journal entries match your selected mood.</p>
        ) : (
          <div className="space-y-4">
            {filteredJournals.map((entry) => (
              <div key={entry.id} className="bg-purple-50 border border-purple-200 rounded p-4 shadow">
                <p className="text-sm text-gray-500 mb-1">
                  {entry.timestamp?.toDate().toLocaleString() || 'Unknown Date'}
                </p>
                <p className="text-gray-800 whitespace-pre-wrap mb-2">{entry.content}</p>
                <p className="text-sm">
                  <strong>Mood:</strong> {entry.emoji} {entry.mood}
                </p>
                <p className="text-sm">
                  <strong>AI Feedback:</strong> {entry.feedback}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/journal')}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to Journal
          </button>
        </div>
      </div>
    </div>
  );
};

export default History;