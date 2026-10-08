import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Books from "./pages/Books";
import ReadingList from "./pages/ReadingList";
import AddBook from "./pages/AddBook";
import "./utils/index";
import ChangeBook from "./pages/ChangeBook";
import DeleteBook from "./pages/DeleteBook";

function App() {
  return (
   <Routes>
      <Route element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="books" element={<Books />} />
          <Route path="reading-list" element={<ReadingList />} />
          <Route path="add-book" element={<AddBook />} />
          <Route path="change-book" element={<ChangeBook />} />
          <Route path="delete-book" element={<DeleteBook />} />

        <Route path="*" element={<h1>Page not found</h1>} />
      </Route>
    </Routes>
  );

};

export default App;
