import { GoogleAuthProvider, signInWithPopup, getAuth } from "@firebase/auth";
import { app } from "../utils/FirebaseGoogle";
import { useDispatch } from "react-redux";
import { signInSuccess, signInFaliure } from "../reduxStore/auth/authSlice";
import { useNavigate } from "react-router-dom";

const OAuthSignUp = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleAuth = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);
      const result = await signInWithPopup(auth, provider);
      const res = await fetch("/api/auth/googlesignup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: result.user.displayName,
          email: result.user.email,
          photo: result.user.photoURL,
        }),
      });
      const jsonResponse = await res.json();

      if (!jsonResponse.success) {
        dispatch(signInFaliure());
        props.onSetMessage(jsonResponse.message);
        return;
      } else {
        dispatch(signInSuccess(jsonResponse));
        props.onSetMessage(jsonResponse.message);
        navigate("/sign-in");
      }
    } catch (error) {
      console.log("Could not login with google", error);
    }
  };

  return (
    <button
      type="button"
      className="bg-red-700 text-white rounded-lg p-3 uppercase hover:opacity-80"
      onClick={handleGoogleAuth}
    >
      Contnue with google
    </button>
  );
};

export default OAuthSignUp;
