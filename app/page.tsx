'use client';

import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

interface Attachment {
  name: string;
  type: string;
  url: string;
}

interface Note {
  id: number;
  content: string;
  createdAt: string;
  selectedDate: string;
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
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [newTodo, setNewTodo] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isFiltering, setIsFiltering] = useState(false);
  const [activeTab, setActiveTab] = useState<'notes' | 'todos'>('notes');
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
      setFilteredNotes(parsedNotes);
    }

    // Load todos
    const savedTodos = window.localStorage.getItem('todos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
  }, []);

  // Filter effect
  useEffect(() => {
    if (isFiltering) {
      const dateStr = selectedDate.toLocaleDateString();
      const filtered = notes.filter(note => note.selectedDate === dateStr);
      setFilteredNotes(filtered);
    } else {
      setFilteredNotes(notes);
    }
  }, [notes, isFiltering, selectedDate]);

  // Add todo function
  const addTodo = () => {
    if (!newTodo.trim()) return;
    
    const todo = {
      id: todos.length + 1,
      content: newTodo,
      completed: false,
      createdAt: new Date().toLocaleString(),
      deadline: null
    };
    
    const updatedTodos = [...todos, todo];
    setTodos(updatedTodos);
    window.localStorage.setItem('todos', JSON.stringify(updatedTodos));
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

  const filterNotesByDate = (date: Date) => {
    const dateStr = date.toLocaleDateString();
    const filtered = notes.filter(note => note.selectedDate === dateStr);
    setFilteredNotes(filtered);
    setIsFiltering(true);
  };

  const clearFilter = () => {
    setFilteredNotes(notes);
    setIsFiltering(false);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowCalendar(false);
    filterNotesByDate(date);
  };

  const fetchNotes = async () => {
    const res = await fetch('/api/notes');
    const data = await res.json();
    setNotes(data);
    window.localStorage.setItem('notes', JSON.stringify(data));
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    
    let attachment;
    if (selectedFile) {
      // Convert file to base64 for local storage
      const base64 = await convertFileToBase64(selectedFile);
      attachment = {
        name: selectedFile.name,
        type: selectedFile.type,
        url: base64
      };
    }
    
    const note = {
      id: Date.now(),
      content: newNote,
      createdAt: new Date().toLocaleString(),
      selectedDate: selectedDate.toLocaleDateString(),
      attachment
    };
    
    const updatedNotes = [...notes, note];
    setNotes(updatedNotes);
    window.localStorage.setItem('notes', JSON.stringify(updatedNotes));
    setNewNote('');
    setSelectedFile(null);
  };

  // Helper function to convert file to base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const updateDeadline = (id: number, deadline: string) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, deadline } : todo
    );
    setTodos(updatedTodos);
    window.localStorage.setItem('todos', JSON.stringify(updatedTodos));
  };

  // Add these helper functions
  const getDeadlineColor = (deadline: string | null): string => {
    if (!deadline) return 'border-gray-200 dark:border-gray-700';
    
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const hoursUntilDeadline = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (deadlineDate < now) return 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20';
    if (hoursUntilDeadline <= 24) return 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20';
    if (hoursUntilDeadline <= 72) return 'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20';
    return 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20';
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
    setFilteredNotes(updatedNotes);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <main className="max-w-7xl mx-auto p-6">
        <div className="text-center mb-12 pt-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Scribble Me Yours 
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Capture your thoughts and ideas, one scribble at a time
          </p>
        </div>

        {/* Mobile Tabs */}
        <div className="md:hidden mb-6">
          <div className="flex rounded-lg bg-white dark:bg-gray-800 p-1">
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-2 px-4 rounded-md transition-colors duration-200
                ${activeTab === 'notes' 
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300' 
                  : 'text-gray-600 dark:text-gray-400'}`}
            >
              Notes
            </button>
            <button
              onClick={() => setActiveTab('todos')}
              className={`flex-1 py-2 px-4 rounded-md transition-colors duration-200
                ${activeTab === 'todos' 
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300' 
                  : 'text-gray-600 dark:text-gray-400'}`}
            >
              To-Do List
            </button>
          </div>
        </div>

        {/* Desktop Split View */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Notes Section */}
          <div className={`flex-1 space-y-4 ${activeTab === 'todos' ? 'hidden md:block' : ''}`}>
            {/* Input Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Notes
              </h2>

              {/* Date Selector */}
              <div className="flex items-center justify-between mb-4">
                <div className="relative">
                  <button 
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="text-sm text-purple-600 dark:text-purple-400
                             hover:text-purple-800 dark:hover:text-purple-300 
                             transition-colors duration-200 flex items-center gap-2"
                  >
                    <span>{isFiltering ? 'Filtered by: ' : 'Select Date: '}</span>
                    <span className="font-medium">{selectedDate.toLocaleDateString()}</span>
                    <span>📅</span>
                  </button>
                  
                  {showCalendar && (
                    <div className="absolute z-10 mt-2">
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 
                                  border border-gray-200 dark:border-gray-700">
                        <Calendar
                          onChange={handleDateSelect}
                          value={selectedDate}
                          className="rounded-lg border-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {isFiltering && (
                  <button
                    onClick={clearFilter}
                    className="text-sm px-4 py-2 bg-gray-100 dark:bg-gray-700
                             hover:bg-gray-200 dark:hover:bg-gray-600
                             rounded-lg transition-colors duration-200
                             text-gray-600 dark:text-gray-300"
                  >
                    Clear Filter
                  </button>
                )}
              </div>

              {/* Notes Input with File Attachment */}
              <div className="space-y-3">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Write a note..."
                  className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 
                           bg-gray-50 dark:bg-gray-900 
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent
                           transition-all duration-200 ease-in-out
                           text-gray-800 dark:text-gray-200"
                  onKeyPress={(e) => e.key === 'Enter' && addNote()}
                />
                
                {/* File Attachment UI */}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="note-file-upload"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <label
                    htmlFor="note-file-upload"
                    className="flex items-center gap-2 px-4 py-2
                             bg-gray-100 dark:bg-gray-700 
                             hover:bg-gray-200 dark:hover:bg-gray-600
                             rounded-lg cursor-pointer transition-colors
                             text-gray-700 dark:text-gray-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                    </svg>
                    Attach File
                  </label>
                  {selectedNoteFile && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedNoteFile.name}
                      </span>
                      <button
                        onClick={() => setSelectedNoteFile(null)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                <button 
                  onClick={addNote}
                  className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 
                           text-white font-medium rounded-lg
                           transition-all duration-200 ease-in-out"
                >
                  Add Note
                </button>
              </div>
            </div>

            {/* Notes List (without outer card) */}
            <div className="space-y-3 max-h-[60vh] overflow-y-auto px-1">
              {(isFiltering ? filteredNotes : notes).map((note) => (
                <div 
                  key={note.id}
                  className="p-4 rounded-lg bg-white dark:bg-gray-800
                           border border-gray-200 dark:border-gray-700
                           shadow-sm hover:shadow-md
                           transition-all duration-200
                           group relative"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-gray-800 dark:text-gray-200 flex-1">
                      {note.content}
                    </p>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="ml-2 text-gray-400 hover:text-red-500 
                               transition-colors duration-200
                               opacity-0 group-hover:opacity-100"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span title="Created">
                      📝 {note.createdAt}
                    </span>
                    <span title="Selected Date">
                      📅 {note.selectedDate}
                    </span>
                  </div>

                  {note.attachment && (
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <a
                        href={note.attachment.url}
                        download={note.attachment.name}
                        className="flex items-center gap-2 text-sm text-purple-600 
                                 hover:text-purple-700 dark:text-purple-400"
                      >
                        📎 {note.attachment.name}
                      </a>
                    </div>
                  )}
                </div>
              ))}

              {isFiltering && filteredNotes.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No notes found for {selectedDate.toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          {/* Todo Section */}
          <div className={`flex-1 space-y-4 ${activeTab === 'notes' ? 'hidden md:block' : ''}`}>
            {/* Todo Input Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                To-Do List
              </h2>

              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-purple-600 dark:text-purple-400">
                  {todos.filter(t => t.completed).length} of {todos.length} tasks completed
                </p>
              </div>
              
              {/* Todo Input with File Attachment */}
              <div className="space-y-3">
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="Add a new task..."
                  className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 
                           bg-gray-50 dark:bg-gray-900 
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent
                           transition-all duration-200 ease-in-out
                           text-gray-800 dark:text-gray-200"
                  onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                />
                
                {/* File Attachment UI */}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    onChange={handleTodoFileSelect}
                    className="hidden"
                    id="todo-file-upload"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <label
                    htmlFor="todo-file-upload"
                    className="flex items-center gap-2 px-4 py-2
                             bg-gray-100 dark:bg-gray-700 
                             hover:bg-gray-200 dark:hover:bg-gray-600
                             rounded-lg cursor-pointer transition-colors
                             text-gray-700 dark:text-gray-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                    </svg>
                    Attach File
                  </label>
                  {selectedTodoFile && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedTodoFile.name}
                      </span>
                      <button
                        onClick={() => setSelectedTodoFile(null)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                <button 
                  onClick={addTodo}
                  className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 
                           text-white font-medium rounded-lg
                           transition-all duration-200 ease-in-out"
                >
                  Add Task
                </button>
              </div>
            </div>

            {/* Todo List */}
            <div className="space-y-3 max-h-[60vh] overflow-y-auto px-1">
              {sortedTodos.map((todo) => (
                <div 
                  key={todo.id}
                  className={`flex flex-col p-4 rounded-lg
                           bg-white dark:bg-gray-800
                           shadow-sm hover:shadow-md
                           transition-all duration-200
                           border ${getDeadlineColor(todo.deadline)}`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                      className="w-5 h-5 rounded border-gray-300 
                               text-purple-600 focus:ring-purple-500"
                    />
                    <span className={`flex-1 ${todo.completed ? 'line-through text-gray-400' : ''}`}>
                      {todo.content}
                    </span>
                    
                    {/* Deadline Status Badge */}
                    {todo.deadline && !todo.completed && (
                      <span className={`text-xs px-2 py-1 rounded-full 
                        ${getDeadlineColor(todo.deadline).includes('red') ? 'text-red-700 dark:text-red-300' :
                          getDeadlineColor(todo.deadline).includes('orange') ? 'text-orange-700 dark:text-orange-300' :
                          getDeadlineColor(todo.deadline).includes('yellow') ? 'text-yellow-700 dark:text-yellow-300' :
                          'text-green-700 dark:text-green-300'}`}
                      >
                        {getDeadlineStatus(todo.deadline)}
                      </span>
                    )}
                    
                    {/* Deadline Button */}
                    <button
                      onClick={() => setExpandedTodo(expandedTodo === todo.id ? null : todo.id)}
                      className="text-gray-400 hover:text-purple-500 transition-colors"
                      title="Set deadline"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>

                  {/* Expandable Deadline Section */}
                  {expandedTodo === todo.id && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <input
                          type="datetime-local"
                          value={todo.deadline || ''}
                          onChange={(e) => updateDeadline(todo.id, e.target.value)}
                          className="flex-1 p-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 
                                   bg-gray-50 dark:bg-gray-900 
                                   focus:ring-2 focus:ring-purple-500 focus:border-transparent
                                   transition-all duration-200 ease-in-out
                                   text-gray-800 dark:text-gray-200"
                        />
                      </div>
                    </div>
                  )}

                  {/* Deadline Display */}
                  {todo.deadline && !expandedTodo && (
                    <div className="mt-2 text-sm">
                      <span className={`
                        ${isDeadlinePassed(todo.deadline) ? 'text-red-500' : 'text-gray-500'}
                        ${todo.completed ? 'line-through' : ''}
                      `}>
                        Due: {formatDeadline(todo.deadline)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
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