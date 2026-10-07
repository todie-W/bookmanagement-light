//von MovieMaker; Typescript bei onADDMovie und event beachten!
// function AddMovieForm({ onAddMovie }) {
//   function handleSubmit(event) {
//     event.preventDefault();

//     // FormData liest die Werte aus dem Formular
//     const formData = new FormData(event.currentTarget);

//     const movie = {
//       title: formData.get("title"),
//       year: Number(formData.get("year")),
//       genre: formData.get("genre"),
//       watched: formData.get("watched") === "on",
//     };

//     onAddMovie(movie);
//     event.currentTarget.reset();
//   }

//   return (
//     <form className="add-movie-form" onSubmit={handleSubmit}>
//       <input name="title" placeholder="Movie title" required />
//       <input name="year" type="number" placeholder="Year" required />
//       <input name="genre" placeholder="Genre" required />
//       <label>
//         <input name="watched" type="checkbox" />
//         Already watched
//       </label>
//       <button>Add movie</button>
//     </form>
//   );
// }

// export default AddMovieForm;


//###### dito TS in unterer Zeile beachten
// function MovieCard({ movie, onSaveMovie, onToggleWatched }) {
//   function handleSaveClick() {
//     onSaveMovie(movie.id);
//   }

//   function handleToggleWatchedClick() {
//     onToggleWatched(movie.id);
//   }

//   return (
//     <article
//       className={`movie-card ${movie.watched ? "movie-card--watched" : ""}`}
//     >
//       {movie.poster && movie.poster !== "N/A" && (
//         <img
//           src={movie.poster}
//           alt={movie.title}
//           className="movie-card__poster"
//         />
//       )}
//       <p className="movie-card__meta">
//         {movie.year} · {movie.genre}
//       </p>
//       <h2>{movie.title}</h2>
//       <p>Rating: {movie.rating}</p>
//       {movie.rating >= 8 && <span className="badge">Top rated</span>}
//       <p>{movie.watched ? "Already watched" : "Watchlist"}</p>
//       <div className="movie-card__actions">
//         <button onClick={handleSaveClick}>Save movie</button>
//         <button onClick={handleToggleWatchedClick}>Toggle watched</button>
//       </div>
//     </article>
//   );
// }

// export default MovieCard;


//TS ####
// import MovieCard from "./MovieCard.jsx";

// function MovieList({ movies, onSaveMovie, onToggleWatched }) {
//   // im Falle einer leeren Liste können wir die Funktion frühzeitig beenden
//   // und eine Nachricht anzeigen
//   if (movies.length === 0) {
//     return <p>No movies found.</p>;
//   }

//   return (
//     <section className="movie-grid">
//       {movies.map((movie) => (
//         <MovieCard
//           key={movie.id}
//           movie={movie}
//           onSaveMovie={onSaveMovie}
//           onToggleWatched={onToggleWatched}
//         />
//       ))}
//     </section>
//   );
// }

// export default MovieList;

//#### TS
// 

// function SearchForm({
//   query,
//   showWatchedOnly,
//   onQueryChange,
//   onShowWatchedOnlyChange,
// }) {
//   function handleSearchChange(event) {
//     onQueryChange(event.target.value);
//   }

//   function handleWatchedChange(event) {
//     onShowWatchedOnlyChange(event.target.checked);
//   }

//   return (
//     <form className="search-form">
//       <label htmlFor="movie-search">Search movies</label>
//       <input
//         id="movie-search"
//         name="query"
//         type="search"
//         placeholder="Search by title"
//         value={query}
//         onChange={handleSearchChange}
//       />
//       <div className="filter-options">
//         <label>
//           <input
//             type="checkbox"
//             checked={showWatchedOnly}
//             onChange={handleWatchedChange}
//           />
//           Only watched movies
//         </label>
//       </div>
//     </form>
//   );
// }

// export default SearchForm;

//##########################App.jsx
// auch hier TS beachten
// import { useEffect, useState } from "react";
// import AddMovieForm from "./components/AddMovieForm.jsx";
// import Header from "./components/Header.jsx";
// import Hero from "./components/Hero.jsx";
// import MovieList from "./components/MovieList.jsx";
// import SearchForm from "./components/SearchForm.jsx";
// import "./App.css";

// function App() {
//   // movies enthält die aktuelle Ergebnisliste aus der API.
//   const [movies, setMovies] = useState([]);
//   const [selectedMovieTitle, setSelectedMovieTitle] = useState("");
//   const [searchQuery, setSearchQuery] = useState("batman");
//   const [showWatchedOnly, setShowWatchedOnly] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [errorMessage, setErrorMessage] = useState("");
//   // page und totalResults gehören zusammen zur OMDb-Pagination.
//   const [page, setPage] = useState(1);
//   const [totalResults, setTotalResults] = useState(0);

//   // canSearch ist abgeleitet und verhindert Requests für zu kurze Suchbegriffe.
//   const canSearch = searchQuery.trim().length >= 3;
//   const moviesForDisplay = canSearch ? movies : [];

//   const filteredMovies = moviesForDisplay
//     .filter((movie) => {
//       return movie.title.toLowerCase().includes(searchQuery.toLowerCase());
//     })
//     .filter((movie) => {
//       return !showWatchedOnly || movie.watched;
//     });

//   const visibleMovies = [...filteredMovies].sort((a, b) => {
//     return b.rating - a.rating;
//   });

//   const visibleMovieCount = visibleMovies.length;
//   // OMDb liefert maximal 10 Suchergebnisse pro Seite.
//   const totalPages = Math.ceil(totalResults / 10);
//   const hasPagination = canSearch && totalPages > 1;
//   const canGoPrevious = page > 1;
//   const canGoNext = page < totalPages;

//   useEffect(() => {
//     document.title = `${visibleMovieCount} movies visible`;
//   }, [visibleMovieCount]);

//   useEffect(() => {
//     if (searchQuery.trim().length < 3) {
//       return;
//     }

//     // Jeder Request bekommt einen eigenen Controller.
//     // Cleanup kann genau diesen Request abbrechen.
//     const controller = new AbortController();

//     async function fetchMovies() {
//       try {
//         // Ab hier ist die UI im Loading-Zustand.
//         setIsLoading(true);
//         setErrorMessage("");

//         const apiKey = import.meta.env.VITE_OMDB_API_KEY;

//         if (!apiKey) {
//           setMovies([]);
//           setErrorMessage("Missing OMDb API key.");
//           setTotalResults(0);
//           return;
//         }

//         const encodedQuery = encodeURIComponent(searchQuery);
//         const response = await fetch(
//           `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodedQuery}&type=movie&page=${page}`,
//           {
//             signal: controller.signal,
//           },
//         );
//         const data = await response.json();

//         if (data.Response === "False") {
//           // OMDb nutzt Response: "False" für fachliche Fehler wie "Movie not found".
//           setMovies([]);
//           setErrorMessage(data.Error);
//           setTotalResults(0);
//           return;
//         }

//         // Die API-Daten werden in unser eigenes Movie-Modell übersetzt.
//         const apiMovies = data.Search.map((movie) => {
//           return {
//             id: movie.imdbID,
//             title: movie.Title,
//             year: movie.Year,
//             genre: movie.Type,
//             rating: 0,
//             watched: false,
//             poster: movie.Poster,
//           };
//         });

//         setMovies(apiMovies);
//         // totalResults ist ein String in der OMDb Response.
//         setTotalResults(Number(data.totalResults));
//       } catch (error) {
//         if (error.name === "AbortError") {
//           return;
//         }

//         setErrorMessage("Could not load movies.");
//       } finally {
//         if (!controller.signal.aborted) {
//           setIsLoading(false);
//         }
//       }
//     }

//     fetchMovies();

//     return () => {
//       // Wenn searchQuery oder page sich ändern, wird der alte Request abgebrochen.
//       controller.abort();
//     };
//   }, [searchQuery, page]);

//   useEffect(() => {
//     if (!selectedMovieTitle) {
//       return;
//     }

//     const timeoutId = setTimeout(() => {
//       setSelectedMovieTitle("");
//     }, 3000);

//     return () => {
//       clearTimeout(timeoutId);
//     };
//   }, [selectedMovieTitle]);

//   function handleAddMovie(movie) {
//     if (movie.title.trim() === "") {
//       return;
//     }

//     const newMovie = {
//       id: crypto.randomUUID(),
//       title: movie.title.trim(),
//       year: movie.year,
//       genre: movie.genre.trim(),
//       rating: 0,
//       watched: movie.watched,
//     };

//     setMovies((currentMovies) => {
//       return [...currentMovies, newMovie];
//     });
//   }

//   function handleSearchQueryChange(nextQuery) {
//     setSearchQuery(nextQuery);
//     // Eine neue Suche startet immer wieder auf der ersten Seite.
//     setPage(1);
//   }

//   function handleSaveMovie(movieId) {
//     const selectedMovie = movies.find((movie) => movie.id === movieId);

//     setSelectedMovieTitle(selectedMovie.title);
//   }

//   function handleToggleWatched(movieId) {
//     setMovies((currentMovies) => {
//       return currentMovies.map((movie) => {
//         if (movie.id !== movieId) {
//           return movie;
//         }

//         return {
//           ...movie,
//           watched: !movie.watched,
//         };
//       });
//     });
//   }

//   return (
//     <main className="app">
//       <Header />
//       <Hero />
//       {selectedMovieTitle && (
//         <p className="movie-stats">Last saved: {selectedMovieTitle}</p>
//       )}
//       <SearchForm
//         query={searchQuery}
//         showWatchedOnly={showWatchedOnly}
//         onQueryChange={handleSearchQueryChange}
//         onShowWatchedOnlyChange={setShowWatchedOnly}
//       />
//       {canSearch && errorMessage && (
//         <p className="movie-stats">{errorMessage}</p>
//       )}
//       {canSearch && isLoading && (
//         <p className="movie-stats">Loading movies...</p>
//       )}
//       {canSearch && !isLoading && !errorMessage && (
//         <MovieList
//           movies={visibleMovies}
//           onSaveMovie={handleSaveMovie}
//           onToggleWatched={handleToggleWatched}
//         />
//       )}
//       {hasPagination && (
//         <div className="pagination">
//           <button
//             type="button"
//             disabled={!canGoPrevious || isLoading}
//             onClick={() => setPage((currentPage) => currentPage - 1)}
//           >
//             Previous
//           </button>
//           <span>
//             Page {page} of {totalPages}
//           </span>
//           <button
//             type="button"
//             disabled={!canGoNext || isLoading}
//             onClick={() => setPage((currentPage) => currentPage + 1)}
//           >
//             Next
//           </button>
//         </div>
//       )}
//       <AddMovieForm onAddMovie={handleAddMovie} />
//     </main>
//   );
// }

// export default App;

