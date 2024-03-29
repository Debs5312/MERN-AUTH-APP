import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  signInStart,
  signInSuccess,
  signInFaliure,
} from "../reduxStore/auth/authSlice";
import { useSelector, useDispatch } from "react-redux";
import OAuthSignIn from "../components/OAuthSignIn";

const SignIn = () => {
  const [data, setData] = useState({});
  const { error, loading } = useSelector((state) => state.auth);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setData({ ...data, [e.target.id]: e.target.value });
  };

  const handleSetMessage = (message) => {
    setMessage(message);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(signInStart());
    const res = await fetch("/api/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const jsonResponse = await res.json();

    if (!jsonResponse.success) {
      dispatch(signInFaliure());
      handleSetMessage(jsonResponse.message);
      return;
    } else {
      dispatch(signInSuccess(jsonResponse.data));
      navigate("/");
    }
  };

  const displayErrorMessage = (message, cssClass) => {
    return <p className={cssClass}>{message}</p>;
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-semibold my-7">Sign In</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          id="email"
          className="bg-slate-100 p-3 rounded-lg"
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="Password"
          id="password"
          className="bg-slate-100 p-3 rounded-lg"
          onChange={handleChange}
        />
        <button
          disabled={loading}
          className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-80 disabled:opacity-60"
        >
          {loading ? "...loading" : "Sign in"}
        </button>
        <OAuthSignIn onSetMessage={handleSetMessage} />
      </form>
      <div className="flex gap-2 pt-2">
        <p>Dont have an account?</p>
        <Link to="/sign-up">
          <span className="text-blue-500">Sign Up</span>
        </Link>
      </div>
      {error ? displayErrorMessage(message, "text-red-700 mt-5 p-1") : ""}
    </div>
  );
};

export default SignIn;
