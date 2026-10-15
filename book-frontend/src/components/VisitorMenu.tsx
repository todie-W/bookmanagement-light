import { Link } from 'react-router-dom';
const API_URL = '/api/books';

const UserMenu = () => {
 // const { logout, user } = useContext(AuthContext)!;
//um User-Angelegenheiten reduziert
  return (
    <>
      <search>
        <input
          type="text"
          placeholder="Search"
          className="input input-bordered w-24 md:w-auto"
        />
      </search>
      <nav>
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle avatar"
          >
            <div className="w-10 rounded-full">
              <img
                // alt="Tailwind CSS Navbar component"
               
              />
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            <li>
              <Link to={'/books'} className="justify-between">
                Books
              </Link>
            </li>

           
              <li>
                <Link to={'/reading-list'}>Reading List</Link>
              </li>
              <li>
          
                <Link to={API_URL}>Buch hinzufügen</Link>
              </li>
           
          </ul>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            <li>
              <Link to={'/change-book'}>Buch ändern</Link>
             
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
};

export default UserMenu;