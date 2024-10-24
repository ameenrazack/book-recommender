import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Book {
  key: string;
  title: string;
  author_name: string[];
  first_publish_year: number;
  cover_i?: number;
  number_of_pages_median?: number;
  description?: string;
}

const popularGenres = [
  'Fiction', 'Fantasy', 'Science Fiction', 'Mystery', 'Thriller', 'Romance',
  'Historical Fiction', 'Non-fiction', 'Biography', 'Self-help', 'Horror'
];

const currentYear = new Date().getFullYear();
const recentYears = Array.from({ length: 10 }, (_, i) => currentYear - i);

const App: React.FC = () => {
  const [genre, setGenre] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [genreSuggestions, setGenreSuggestions] = useState<string[]>([]);
  const [yearSuggestions, setYearSuggestions] = useState<number[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`https://openlibrary.org/search.json?q=${genre}&first_publish_year=${year}`);
      const fetchedBooks = response.data.docs.slice(0, 10);
      
      const booksWithDetails = await Promise.all(fetchedBooks.map(async (book: Book) => {
        try {
          const detailsResponse = await axios.get(`https://openlibrary.org${book.key}.json`);
          return {
            ...book,
            number_of_pages_median: detailsResponse.data.number_of_pages,
            description: detailsResponse.data.description?.value || detailsResponse.data.description || 'No description available.'
          };
        } catch (error) {
          console.error('Error fetching book details:', error);
          return book;
        }
      }));
      
      setBooks(booksWithDetails);
    } catch (err) {
      setError('An error occurred while fetching books. Please try again.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (genre && year) {
      fetchBooks();
    }
  }, [genre, year]);

  const handleGenreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGenre(value);
    if (value) {
      const filtered = popularGenres.filter(g => g.toLowerCase().includes(value.toLowerCase()));
      setGenreSuggestions(filtered);
    } else {
      setGenreSuggestions([]);
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setYear(value);
    if (value) {
      const filtered = recentYears.filter(y => y.toString().includes(value));
      setYearSuggestions(filtered);
    } else {
      setYearSuggestions([]);
    }
  };

  const selectGenre = (selectedGenre: string) => {
    setGenre(selectedGenre);
    setGenreSuggestions([]);
  };

  const selectYear = (selectedYear: number) => {
    setYear(selectedYear.toString());
    setYearSuggestions([]);
  };

  const handleBookClick = (book: Book) => {
    setSelectedBook(book === selectedBook ? null : book);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-gray-800 shadow-lg sm:rounded-3xl sm:p-20 border border-gray-700">
          <h1 className="text-3xl font-bold mb-8 text-center text-purple-400">BookNest</h1>
          <div className="mb-5 relative">
            <input
              type="text"
              placeholder="Enter genre"
              value={genre}
              onChange={handleGenreChange}
              className="w-full px-4 py-3 bg-gray-700 placeholder-gray-400 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-300"
            />
            {genreSuggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-gray-700 border border-gray-600 mt-1 rounded-md shadow-lg">
                {genreSuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-gray-600 cursor-pointer transition duration-300"
                    onClick={() => selectGenre(suggestion)}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mb-5 relative">
            <input
              type="text"
              placeholder="Enter year"
              value={year}
              onChange={handleYearChange}
              className="w-full px-4 py-3 bg-gray-700 placeholder-gray-400 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-300"
            />
            {yearSuggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-gray-700 border border-gray-600 mt-1 rounded-md shadow-lg">
                {yearSuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-gray-600 cursor-pointer transition duration-300"
                    onClick={() => selectYear(suggestion)}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            onClick={fetchBooks}
            className="w-full px-4 py-3 font-bold text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition duration-300"
          >
            Get Recommendations
          </button>
          {loading && <p className="mt-5 text-center">Loading...</p>}
          {error && <p className="mt-5 text-center text-red-400">{error}</p>}
          {books.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4 text-purple-400">Recommended Books:</h2>
              <ul className="space-y-6">
                {books.map((book) => (
                  <li 
                    key={book.key} 
                    className={`border border-gray-700 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${selectedBook === book ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                    onClick={() => handleBookClick(book)}
                  >
                    <div className="flex p-4">
                      <img
                        src={book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : '/placeholder.svg?height=200&width=130'}
                        alt={`Cover of ${book.title}`}
                        className={`w-32 h-48 object-cover mr-4 rounded-md transition-all duration-300 ${selectedBook === book ? 'w-40 h-60' : ''}`}
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2 text-purple-400">{book.title}</h3>
                        <p className="text-sm text-gray-400 mb-1">
                          by {book.author_name ? book.author_name.join(', ') : 'Unknown Author'}
                        </p>
                        <p className="text-sm text-gray-400 mb-1">
                          Published: {book.first_publish_year || 'Unknown'}
                        </p>
                        {book.number_of_pages_median && (
                          <p className="text-sm text-gray-400 mb-2">
                            Pages: {book.number_of_pages_median}
                          </p>
                        )}
                        <p className={`text-sm text-gray-300 ${selectedBook === book ? '' : 'line-clamp-3'}`}>
                          {typeof book.description === 'string' 
                            ? book.description
                            : 'No description available.'}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;