let notes = [];

export async function GET() {
  return new Response(JSON.stringify(notes), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function POST(request) {
  const { content, createdAt } = await request.json();
  const newNote = { 
    id: notes.length + 1, 
    content,
    createdAt 
  };
  notes.push(newNote);
  return new Response(JSON.stringify(newNote), {
    status: 201,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function DELETE(request) {
  const { id } = await request.json();
  notes = notes.filter(note => note.id !== id);
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}