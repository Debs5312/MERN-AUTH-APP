import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutStart, logoutSuccess } from "../reduxStore/auth/authSlice.js";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../utils/FirebaseGoogle.js";

const Profile = () => {
  const fileRef = useRef(null);
  const { currentUser, loading } = useSelector((state) => state.auth);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [matchingError, setMatchingError] = useState(false);
  const [image, setImage] = useState(undefined);
  const [imageUploadProgress, setImageUploadProgress] = useState();
  const [imageUploadError, setImageUploadError] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (image) handleFileUpload(image);
  }, [image]);

  const handleFileUpload = async (image) => {
    const storage = getStorage(app);
    const imageFileName = new Date().getTime() + image.name;
    const storageRef = ref(storage, imageFileName);
    const uploadTask = uploadBytesResumable(storageRef, image);
    uploadTask.on("state-changed", (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      setImageUploadProgress(Math.round(progress));
    });
    (error) => {
      setImageUploadError(true);
    };
    () => {
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {});
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMatchingError(false);
    if (newPassword === confirmPassword) {
      console.log("Password reset!!");
    } else {
      setMatchingError(true);
      return;
    }
  };

  const onRemoveCookie = () => {
    dispatch(logoutSuccess());
    console.log("Cookie removed!!");
    navigate("/sign-in");
  };

  const handleLogout = async () => {
    dispatch(logoutStart());
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userid: currentUser._id,
          loginHistoryId: currentUser.loginHistoryId,
        }),
      });
      const jsonResponse = await res.json();
      console.log(jsonResponse);
      onRemoveCookie();
    } catch (error) {
      console.log(error);
    }
  };

  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmedPassword = (e) => {
    setConfirmPassword(e.target.value);
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Welcome!</h1>
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <input
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />
        <img
          src={currentUser.profilePicture}
          alt="profile"
          className="h-24 w-24 rounded-full object-cover self-center cursor-pointer"
          onClick={() => fileRef.current.click()}
        />
        <input
          type="text"
          id="username"
          placeholder="Username"
          className="bg-slate-100 rounded-lg p-3 text-slate-400"
          defaultValue={currentUser.username}
          disabled
        />
        <input
          type="email"
          id="email"
          placeholder="Email"
          className="bg-slate-100 rounded-lg p-3 text-slate-400"
          defaultValue={currentUser.email}
          disabled
        />
        <input
          type="password"
          id="password"
          placeholder="New Password"
          className="bg-slate-100 rounded-lg p-3"
          onChange={handlePasswordChange}
        />
        <input
          type="text"
          id="confPassword"
          placeholder="Confirm Password"
          className="bg-slate-100 rounded-lg p-3"
          onChange={handleConfirmedPassword}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-80 disabled:opacity-60"
        >
          {loading ? "...Updating" : "Update"}
        </button>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loading}
          className="bg-red-700 text-white p-3 rounded-lg uppercase hover:opacity-80 disabled:opacity-60"
        >
          {loading ? "...Loading" : "Logout"}
        </button>
      </form>
      {matchingError ? (
        <p className="text-red-900 mt-4">
          **New Password and Confirm Password doesn't Match
        </p>
      ) : (
        ""
      )}
    </div>
  );
};

export default Profile;
