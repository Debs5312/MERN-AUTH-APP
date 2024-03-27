import { useState } from "react";
import { Link } from "react-router-dom";

const SignUp = () => {
  const [data, setData] = useState({});
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setData({ ...data, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const jsonResponse = await res.json();
    setLoading(false);

    if (!jsonResponse.success) {
      setError(true);
      setMessage(jsonResponse.message);
      return;
    } else {
      setError(false);
      setMessage(jsonResponse.message);
    }
  };

  const displayErrorMessage = (message, cssClass) => {
    return <p className={cssClass}>{message}</p>;
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-semibold my-7">SignUp</h1>
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
      </form>
      <div className="flex gap-2 pt-2">
        <p>Have an account?</p>
        <Link to="/sign-in">
          <span className="text-blue-500">Sign In</span>
        </Link>
      </div>
      {error
        ? displayErrorMessage(message, "text-red-700 mt-5 p-1")
        : displayErrorMessage(message, "text-green-700 mt-5 p-1")}
    </div>
  );
};

export default SignUp;
