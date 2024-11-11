'use client';

import { useState, useEffect } from 'react';
//import type { Value } from 'react-calendar/dist/cjs/shared/types';

interface Attachment {
  name: string;
  type: string;
  url: string;
}

interface Note {
  id: number;
  content: string;
  createdAt: string;
  attachment?: Attachment;
}

interface Todo {
  id: number;
  content: string;
  completed: boolean;
  createdAt: string;
  deadline?: string;
  attachment?: Attachment;
}

export default function HomePage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newNote, setNewNote] = useState('');
  const [newTodo, setNewTodo] = useState('');
  const [expandedTodo, setExpandedTodo] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedNoteFile, setSelectedNoteFile] = useState<File | null>(null);
  const [selectedTodoFile, setSelectedTodoFile] = useState<File | null>(null);

  // Load data on mount
  useEffect(() => {
    // Load notes
    const savedNotes = window.localStorage.getItem('notes');
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes);
      setNotes(parsedNotes);
    }

    // Load todos
    const savedTodos = window.localStorage.getItem('todos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
  }, []);

  // Update the addTodo function
const addTodo = () => {
  if (!newTodo.trim()) return;
  
  const newTodoItem: Todo = {  // Explicitly type as Todo
    id: Date.now(),  // Use Date.now() instead of todos.length + 1
    content: newTodo,
    completed: false,
    createdAt: new Date().toLocaleString()
    // Don't include deadline if it's not set
  };
  
  setTodos(prevTodos => [...prevTodos, newTodoItem]);
  window.localStorage.setItem('todos', JSON.stringify([...todos, newTodoItem]));
  setNewTodo('');
};

  // Toggle todo completion
  const toggleTodo = (id: number) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);
    window.localStorage.setItem('todos', JSON.stringify(updatedTodos));
  };

  // Delete todo
  const deleteTodo = (id: number) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    setTodos(updatedTodos);
    window.localStorage.setItem('todos', JSON.stringify(updatedTodos));
  };

  const fetchNotes = async () => {
    const res = await fetch('/api/notes');
    const data = await res.json();
    setNotes(data);
    window.localStorage.setItem('notes', JSON.stringify(data));
  };

  // Helper function for file conversion
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Update addNote to be async
  const addNote = async () => {
    if (!newNote.trim()) return;
    
    let attachment: Attachment | undefined;
    if (selectedFile) {
      try {
        const base64 = await convertFileToBase64(selectedFile);
        attachment = {
          name: selectedFile.name,
          type: selectedFile.type,
          url: base64
        };
      } catch (error) {
        console.error('Error converting file:', error);
      }
    }

    const newNoteItem: Note = {
      id: Date.now(),
      content: newNote,
      createdAt: new Date().toLocaleString(),
      attachment
    };
    
    const updatedNotes = [...notes, newNoteItem];
    setNotes(updatedNotes);
    setNewNote('');
    setSelectedFile(null); // Clear the selected file
    
    // Save to localStorage
    window.localStorage.setItem('notes', JSON.stringify(updatedNotes));
  };

  const updateDeadline = (id: number, deadline: string) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, deadline } : todo
    );
    setTodos(updatedTodos);
    window.localStorage.setItem('todos', JSON.stringify(updatedTodos));
  };

  // Add these helper functions
  const getDeadlineColor = (deadline: string | undefined): string => {
    if (!deadline) return 'border-l-4 border-l-slate-300 bg-white/60 dark:bg-slate-800/60'; // No deadline
    
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const hoursUntilDeadline = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (deadlineDate < now) 
      return 'border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-900/10';  // Overdue
    if (hoursUntilDeadline <= 24) 
      return 'border-l-4 border-l-orange-500 bg-orange-50/50 dark:bg-orange-900/10';  // Due within 24h
    if (hoursUntilDeadline <= 72) 
      return 'border-l-4 border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10';  // Due within 72h
    return 'border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-900/10';  // Due later
  };

  const getDeadlineStatus = (deadline: string | null): string => {
    if (!deadline) return '';
    
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const hoursUntilDeadline = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (deadlineDate < now) return 'Overdue';
    if (hoursUntilDeadline <= 24) return 'Due soon';
    if (hoursUntilDeadline <= 72) return 'Upcoming';
    return 'Scheduled';
  };

  // Add sorting function
  const sortedTodos = [...todos].sort((a, b) => {
    // Put completed items at the bottom
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    
    // If neither has a deadline, maintain original order
    if (!a.deadline && !b.deadline) return 0;
    
    // Put items without deadlines at the bottom
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    
    // Sort by deadline
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  const deleteNote = (id: number) => {
    console.log('Deleting note:', id);
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    window.localStorage.setItem('notes', JSON.stringify(updatedNotes));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleNoteFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedNoteFile(file);
    }
  };

  const handleTodoFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedTodoFile(file);
    }
  };

  // First, add this helper function at the top of your component
  const getDeadlineInfo = (deadline: string | undefined) => {
    if (!deadline) return { status: 'No deadline', colorClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' };
    
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const hoursUntilDeadline = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (deadlineDate < now) {
      return { 
        status: 'Overdue', 
        colorClass: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
      };
    }
    if (hoursUntilDeadline <= 24) {
      return { 
        status: 'Due soon', 
        colorClass: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
      };
    }
    if (hoursUntilDeadline <= 72) {
      return { 
        status: 'Upcoming', 
        colorClass: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
      };
    }
    return { 
      status: 'Scheduled', 
      colorClass: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
    };
  };

  return (
    <div className="min-h-screen bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-slate-50 via-indigo-50 to-cyan-50 
                  dark:from-slate-900 dark:via-indigo-950 dark:to-cyan-950 p-4 sm:p-8 relative">
      <main className="max-w-[1400px] mx-auto">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 
                         dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 
                         text-transparent bg-clip-text tracking-tight">
            Scribble Me Mine
          </h1>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            Your digital canvas for thoughts and tasks
          </p>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Notes Column */}
          <div className="space-y-6">
            {/* Input Card - Fixed height */}
            <div className="h-[218px] backdrop-blur-xl bg-white/60 dark:bg-slate-800/60 
                           rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 
                           relative">
              <div className="p-6 flex flex-col h-full">
                {/* Header - Same height on both sides */}
                <div className="flex items-center justify-between h-[40px]">
                  <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
                    Notes
                  </h2>
                </div>

                {/* Input Area - Same spacing */}
                <div className="flex flex-col gap-4 mt-4">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Write a note..."
                    className="w-full h-[42px] px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-600
                             bg-white dark:bg-slate-900
                             focus:border-indigo-500 dark:focus:border-indigo-400
                             focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20
                             text-slate-800 dark:text-slate-100
                             placeholder:text-slate-400 dark:placeholder:text-slate-500
                             resize-none overflow-hidden"
                  />

                  <button 
                    onClick={() => {
                      if (!newNote.trim()) return;
                      addNote();
                    }}
                    className="w-full h-[42px] px-6
                             bg-gradient-to-r from-indigo-500 to-purple-500 
                             hover:from-indigo-600 hover:to-purple-600
                             text-white font-medium rounded-xl
                             shadow-lg shadow-indigo-500/25"
                  >
                    Add Note
                  </button>
                </div>
              </div>
            </div>

            {/* Notes List */}
            <div className="space-y-4">
              {notes.map((note) => (
                <div 
                  key={note.id}
                  className="group backdrop-blur-xl bg-white/60 dark:bg-slate-800/60 
                           rounded-xl p-4 
                           shadow-lg hover:shadow-xl
                           border border-white/20 dark:border-slate-700/50
                           transform hover:-translate-y-0.5
                           transition-all duration-300"
                >
                  <div className="flex flex-col gap-2">
                    <p className="text-slate-800 dark:text-slate-100">
                      {note.content}
                    </p>
                    <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                      <span>{new Date(note.createdAt).toLocaleString()}</span>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks Column - Exactly matching structure */}
          <div className="space-y-6">
            {/* Input Card - Same fixed height */}
            <div className="h-[218px] backdrop-blur-xl bg-white/60 dark:bg-slate-800/60 
                           rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50">
              <div className="p-6 flex flex-col h-full">
                {/* Header - Same height */}
                <div className="flex items-center justify-between h-[40px]">
                  <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
                    Tasks
                  </h2>
                  <span className="flex items-center gap-2 px-4 py-2 
                                bg-indigo-50 dark:bg-indigo-900/30 
                                text-indigo-600 dark:text-indigo-300
                                rounded-xl">
                    {todos.filter(t => !t.completed).length} remaining
                  </span>
                </div>

                {/* Input Area - Same spacing */}
                <div className="flex flex-col gap-4 mt-4">
                  <input
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="Add a new task..."
                    className="w-full h-[42px] px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-600
                             bg-white dark:bg-slate-900
                             focus:border-indigo-500 dark:focus:border-indigo-400
                             focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20
                             text-slate-800 dark:text-slate-100
                             placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                  />

                  <button 
                    onClick={() => {
                      if (!newTodo.trim()) return;
                      addTodo();
                    }}
                    className="w-full h-[42px] px-6
                             bg-gradient-to-r from-indigo-500 to-purple-500 
                             hover:from-indigo-600 hover:to-purple-600
                             text-white font-medium rounded-xl
                             shadow-lg shadow-indigo-500/25"
                  >
                    Add Task
                  </button>
                </div>
              </div>
            </div>

            {/* Tasks List - Separate from input box */}
            <div className="space-y-4">
              {sortedTodos.map((todo) => {
                const deadlineInfo = getDeadlineInfo(todo.deadline);
                
                return (
                  <div 
                    key={todo.id}
                    className={`group backdrop-blur-xl
                               rounded-xl p-4 
                               shadow-lg hover:shadow-xl
                               transform hover:-translate-y-0.5
                               transition-all duration-300
                               ${getDeadlineColor(todo.deadline)}`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id)}
                        className="w-5 h-5 rounded border-slate-300 
                                 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className={`flex-1 ${todo.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                        {todo.content}
                      </span>
                      
                      {todo.deadline && !todo.completed && (
                        <span className={`text-xs px-2 py-1 rounded-full 
                                      ${deadlineInfo.colorClass}`}>
                          {deadlineInfo.status}
                        </span>
                      )}
                      
                      <button
                        onClick={() => setExpandedTodo(expandedTodo === todo.id ? null : todo.id)}
                        className="text-slate-400 hover:text-blue-500 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>

                    {expandedTodo === todo.id && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <input
                          type="datetime-local"
                          value={todo.deadline || ''}
                          onChange={(e) => updateDeadline(todo.id, e.target.value)}
                          className="w-full p-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 
                                   bg-slate-50 dark:bg-slate-900/50
                                   focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function isDeadlinePassed(deadline: string): boolean {
  return new Date(deadline) < new Date();
}

function formatDeadline(deadline: string): string {
  return new Date(deadline).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
}