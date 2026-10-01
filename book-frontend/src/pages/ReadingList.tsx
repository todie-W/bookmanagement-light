import { useEffect, useState } from "react";


const bookStatus = ["read", "pending", "wishlist"] as const;
type BookStatus = (typeof bookStatus)[number];

interface BookRef {
  title: string;
  author: string;
  description: string;
  _id: string;
}

interface ReadingListBook {
  _id: string;
  status: BookStatus;
  bookRefId: BookRef;
}

const ReadingList = () => {
  const [page] = useState(1);
  const [books, setBooks] = useState<ReadingListBook[] | null>(null);

  useEffect(() => {
    const fetchReadingList = async () => {
      //if (!user) return;
      try {
        const res = await fetch(`/api/books?page=${page}`);
        const { data, message } = await res.json();
        if (!res.ok) throw new Error(message);
        setBooks(data.readingList);
      } catch {
        // toaster?.error("Failed to get your Reading List");
      }
    };

    fetchReadingList();
  }, [page]);

  return (
    <>
      <h1>ReadingList</h1>
      {books &&
        books.map((book) => {
          const { title, author, description } = book.bookRefId;
          const statuses = bookStatus.filter((s) => s !== book.status);
          return (
            <div key={book._id} className="card card-dash bg-base-100 w-96">
              <div className="card-body">
                <h2 className="card-title">{title}</h2>
                <p>{author}</p>
                <p>{description}</p>
                <div className="card-actions justify-end">
                  <select
                    value={book.status}
                    className="select select-accent capitalize"
                    onChange={() => alert("HANDLE STATUS CHANGE")}
                  >
                    <option disabled={true}>{book.status}</option>
                    {statuses.map((s) => (
                      <option key={book._id + s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          );
        })}
    </>
  );
};


export default ReadingList;
