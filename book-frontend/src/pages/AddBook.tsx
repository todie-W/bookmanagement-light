import React, { useState, type ChangeEvent, type FormEvent } from 'react';

type BookFormData = {
  author: string;  
  title: string;
  description: string;
  pageNumber: number;
  year: number;
  isbn: string;
  genre: string;
};

export const BookForm: React.FC = () => {
  const initialFormState: BookFormData = {
    title: '',
    author: '',
    description: '',
    pageNumber: 0,
    year: new Date().getFullYear(),
    isbn: '',
    genre: '',
  };

  const [formData, setFormData] = useState<BookFormData>(initialFormState);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Handler für Input-Änderungen
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numericFields = ['pageNumber', 'year'];

    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number.parseInt(value, 10) || 0 : value,
    }));
  };

  // Formular absenden
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
        //localhost:5173/books, der Client oder localhost:3000/books als Backend-URL
      const payload = { ...formData, genre: [formData.genre] };
      const response = await fetch('http://localhost:3000/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Etwas ist schiefgelaufen.');
      }

      setMessage({ text: `Buch "${data.title}" erfolgreich hinzugefügt!`, isError: false });
      setFormData(initialFormState); // Formular zurücksetzen
    } catch (error: any) {
      setMessage({ text: error.message || 'Fehler beim Verbinden mit dem Server.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-7">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-600">Sammlung erweitern</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Neues Buch eintragen</h1>
        <p className="mt-2 text-sm text-slate-500">Ergänze die Buchdetails und speichere den Titel in deiner Sammlung.</p>
      </div>
      
      {message && (
        <div role={message.isError ? 'alert' : 'status'} className={`mb-5 rounded-xl border p-3 text-sm ${message.isError ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Autor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Autor *</label>
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            placeholder="z.B. J.R.R. Tolkien"
          />
        </div>

        {/* Titel */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Buchtitel *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            placeholder="z.B. Der Herr der Ringe"
          />
        </div>

          {/* Beschreibung */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung (optional)</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            placeholder="z.B. Ein epischer Fantasy-Roman"
          />
        </div>

      {/* Seitenzahl */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Seitenzahl *</label>
        <input
          type="number"
          name="pageNumber"
          value={formData.pageNumber || ''}
          onChange={handleChange}
          required
          min="1"
          className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
        />
      </div>

        {/* Erscheinungsjahr */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Erscheinungsjahr *</label>
          <input
            type="number"
            name="year"
            value={formData.year || ''}
            onChange={handleChange}
            required
            min="0"
            max={new Date().getFullYear() + 1}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          />
        </div>

        {/* ISBN */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ISBN (optional)</label>
          <input
            type="text"
            name="isbn"
            value={formData.isbn}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            placeholder="z.B. 978-3608938289"
          />
        </div>


        {/* Genre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Genre *</label>
          <select
            name="genre"
            value={formData.genre}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          >
            <option value="">Bitte wählen</option>
            <option value="Fantasy">Fantasy</option>
            <option value="Science Fiction">Science Fiction</option>
            <option value="Romance">Romance</option>
            <option value="Thriller">Thriller</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full rounded-xl py-3 px-4 font-semibold text-white transition ${
            loading 
              ? 'cursor-not-allowed bg-indigo-400' 
              : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'
          }`}
        >
          {loading ? 'Wird gespeichert...' : 'Buch speichern'}
        </button>
      </form>
    </div>
  );
};
export default BookForm;