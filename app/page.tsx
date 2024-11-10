'use client';

import { useState, useEffect } from 'react';

interface Note {
  id: number;
  content: string;
}

export default function HomePage() {
  console.log('HomePage component is rendering');
  
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
      body: JSON.stringify({ content: newNote }),
    });
    setNewNote('');
    fetchNotes();
  };

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8">Note-Taking App</h1>
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Type your note here..."
            className="flex-1 p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent"
            onKeyPress={(e) => e.key === 'Enter' && addNote()}
          />
          <button 
            onClick={addNote}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Add Note
          </button>
        </div>
        <div className="space-y-4">
          {notes.map((note) => (
            <p 
              key={note.id}
              className="p-4 rounded border border-gray-200 dark:border-gray-800 bg-white/5"
            >
              {note.content}
            </p>
          ))}
        </div>
      </div>
    </main>
  );
}