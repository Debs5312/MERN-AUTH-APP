import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  signInStart,
  signInSuccess,
  signInFaliure,
} from "../reduxStore/auth/authSlice";
import { useSelector, useDispatch } from "react-redux";

import OAuthSignUp from "../components/OAuthSignUp";

const SignUp = () => {
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

  const displayMessage = (message, cssClass) => {
    return <p className={cssClass}>{message}</p>;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(signInStart());
    const res = await fetch("/api/auth/signup", {
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
      dispatch(signInSuccess(jsonResponse));
      handleSetMessage(jsonResponse.message);
      navigate("/sign-in");
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-semibold my-7">Sign Up</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Username"
          id="username"
          className="bg-slate-100 p-3 rounded-lg"
          onChange={handleChange}
        />
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
          className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-70"
        >
          {loading ? "...loading" : "Sign up"}
        </button>
        <OAuthSignUp onSetMessage={handleSetMessage} />
      </form>
      <div className="flex gap-2 pt-2">
        <p>Have an account?</p>
        <Link to="/sign-in">
          <span className="text-blue-500">Sign In</span>
        </Link>
      </div>
      {error
        ? displayMessage(message, "text-red-700 mt-5 p-1")
        : displayMessage(message, "text-green-700 mt-5 p-1")}
    </div>
  );
};

export default SignUp;
