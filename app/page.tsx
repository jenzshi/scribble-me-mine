'use client';

import { useState, useEffect } from 'react';

interface Note {
  id: number;
  content: string;
  createdAt?: string;
}

export default function HomePage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  const fetchNotes = async () => {
    const res = await fetch('/api/notes');
    const data = await res.json();
    setNotes(data);
    localStorage.setItem('notes', JSON.stringify(data));
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    
    await fetch('/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        content: newNote,
        createdAt: new Date().toLocaleString()
      }),
    });
    setNewNote('');
    fetchNotes();
  };

  const deleteNote = async (id: number) => {
    await fetch('/api/notes', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });
    fetchNotes();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <main className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-12 pt-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Scribble Me Yours
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Capture your thoughts, one note at a time
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="What's on your mind?"
              className="flex-1 p-3 rounded-lg border border-gray-200 dark:border-gray-700 
                       bg-gray-50 dark:bg-gray-900 
                       focus:ring-2 focus:ring-purple-500 focus:border-transparent
                       transition-all duration-200 ease-in-out
                       text-gray-800 dark:text-gray-200
                       placeholder-gray-400 dark:placeholder-gray-500"
              onKeyPress={(e) => e.key === 'Enter' && addNote()}
            />
            <button 
              onClick={addNote}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 
                       text-white font-medium rounded-lg
                       transform hover:scale-105
                       transition-all duration-200 ease-in-out
                       focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Add Note
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {notes.map((note) => (
            <div 
              key={note.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-6
                         border border-gray-100 dark:border-gray-700
                         shadow-sm hover:shadow-md
                         transform hover:-translate-y-1
                         transition-all duration-200 ease-in-out
                         relative group"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-gray-800 dark:text-gray-200 mb-2">
                    {note.content}
                  </p>
                  {note.createdAt && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Added on {note.createdAt}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="ml-4 p-2 text-gray-400 hover:text-red-500
                            opacity-0 group-hover:opacity-100
                            transition-all duration-200
                            rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"
                  aria-label="Delete note"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}