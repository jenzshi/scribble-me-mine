let notes = []; // Temporary storage for notes

export async function GET() {
  return new Response(JSON.stringify(notes), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function POST(request) {
  const { content } = await request.json();
  const newNote = { id: notes.length + 1, content };
  notes.push(newNote);
  return new Response(JSON.stringify(newNote), {
    status: 201,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}