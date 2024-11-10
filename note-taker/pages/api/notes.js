let notes = []; // Temporary storage

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { content } = req.body;
    notes.push({ id: notes.length + 1, content });
    res.status(200).json({ message: 'Note added successfully!' });
  } else if (req.method === 'GET') {
    res.status(200).json(notes);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
