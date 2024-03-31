import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const Header = () => {
  const { currentUser } = useSelector((state) => state.auth);
  const signinOrProfile = (
    <Link to="/profile">
      {currentUser ? (
        <img
          src={currentUser.profilePicture}
          alt="profile"
          className="h-7 w-7 rounded-full object-cover"
        />
      ) : (
        <li>Sign-In</li>
      )}
    </Link>
  );
  return (
    <div className="bg-slate-200">
      <div className="flex justify-between items-center mx-auto max-w-6xl p-3">
        <Link to="/">
          <h1 className="font-bold uppercase">Auth App</h1>
        </Link>
        <ul className="flex gap-4">
          <Link to="/">
            <li>Home</li>
          </Link>
          <Link to="/about">
            <li>About</li>
          </Link>
          {signinOrProfile}
        </ul>
      </div>
    </div>
  );
};

export default Header;
