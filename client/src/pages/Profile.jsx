import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  logoutStart,
  logoutSuccess,
  LogoutFaliure,
  updateFaliure,
  updateStart,
  updateSuccess,
} from "../reduxStore/auth/authSlice.js";
import { useNavigate } from "react-router-dom";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../utils/FirebaseGoogle.js";

const Profile = () => {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.auth);
  const [matchingError, setMatchingError] = useState(false);
  const [image, setImage] = useState(undefined);
  const [imageUploadProgress, setImageUploadProgress] = useState();
  const [imageUploadError, setImageUploadError] = useState(false);
  const [formData, setFormData] = useState({ password: "", confPassword: "" });
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (image) handleFileUpload(image);
  }, [image]);

  const handleSetMessage = (message) => {
    setMessage(message);
  };

  const handleFileUpload = async (image) => {
    const storage = getStorage(app);
    const imageFileName = new Date().getTime() + image.name;
    const storageRef = ref(storage, imageFileName);
    const uploadTask = uploadBytesResumable(storageRef, image);
    uploadTask.on(
      "state-changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImageUploadProgress(Math.round(progress));
      },
      (error) => {
        setImageUploadError(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData({ ...formData, profilePicture: downloadURL });
        });
      }
    );
  };

  const addPasswdtoFormData = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const resetData = () => {
    setFormData({ ...formData, password: "", confPassword: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMatchingError(false);
    if (formData.password === formData.confPassword) {
      dispatch(updateStart());
      try {
        const { confPassword, ...finalData } = formData;
        const res = await fetch(`/api/user/update/${currentUser._id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(finalData),
        });
        const jsonResponse = await res.json();
        if (!jsonResponse.success) {
          dispatch(updateFaliure());
          handleSetMessage(jsonResponse.message);
        } else {
          dispatch(updateSuccess(jsonResponse.data));
          handleSetMessage(jsonResponse.message);
          resetData();
        }
      } catch (error) {
        dispatch(updateFaliure());
        console.log(error);
      }
    } else {
      setMatchingError(true);
      return;
    }
  };

  const onRemoveCookie = () => {
    dispatch(logoutSuccess());
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

      if (!jsonResponse.success) {
        dispatch(LogoutFaliure());
        handleSetMessage(jsonResponse.message);
        return;
      } else {
        onRemoveCookie();
      }
    } catch (error) {
      dispatch(LogoutFaliure());
      console.log(error);
    }
  };

  const displayErrorMessage = (message, cssClass) => {
    return <p className={cssClass}>{message}</p>;
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
          src={formData.profilePicture || currentUser.profilePicture}
          alt="profile"
          className="h-24 w-24 rounded-full object-cover self-center cursor-pointer"
          onClick={() => fileRef.current.click()}
        />
        <p className="text-sm self-center">
          {imageUploadError ? (
            <span className="text-red-700">Error uploading image....</span>
          ) : imageUploadProgress > 0 && imageUploadProgress < 100 ? (
            <span className="text-green-700">{`Uploading... ${imageUploadProgress} %`}</span>
          ) : imageUploadProgress === 100 ? (
            <span className="text-blue-700">Uploaded successfully..</span>
          ) : (
            ""
          )}
        </p>
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
          value={formData.password}
          placeholder="New Password"
          className="bg-slate-100 rounded-lg p-3"
          onChange={addPasswdtoFormData}
        />
        <input
          type="text"
          id="confPassword"
          value={formData.confPassword}
          placeholder="Confirm Password"
          className="bg-slate-100 rounded-lg p-3"
          onChange={addPasswdtoFormData}
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
      {error
        ? displayErrorMessage(message, "text-red-700 mt-5 p-1")
        : displayErrorMessage(message, "text-green-700 mt-5 p-1")}
    </div>
  );
};

export default Profile;
