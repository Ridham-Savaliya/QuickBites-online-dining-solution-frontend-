import React, { useContext, useState } from "react";
import { AppContext } from "../Context/AppContext";
import { assets } from "../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const { backend, setToken } = useContext(AppContext);

  const [state, setState] = useState("Login"); // "Sign Up", "Login", "Forget Password", "Reset Password"
  const [email, setEmail] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Submit handler for login/register/reset password
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    let url = backend;
    let payload = {};

    try {
      if (state === "Sign Up") {
        url += "/api/user/register";
        payload = { name, email, password };
      } else if (state === "Login") {
        url += "/api/user/login";
        payload = { email, password };
      } else if (state === "Reset Password") {
        url += "/api/user/reset-password";
        payload = { email: resetEmail, newPassword, cPassword: confirmPassword };
      }

      const { data } = await axios.post(url, payload);

      if (data.success) {
        if (state === "Reset Password") {
          toast.success(data.message);
          setState("Login");
          setNewPassword("");
          setConfirmPassword("");
          setResetEmail("");
        } else {
          setToken(data.token);
          localStorage.setItem("user-token", data.token);
          toast.success(data.message);
          navigate("/");
        }
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Google login for Login form
  const handleGoogleLogin = async (credential) => {
    try {
      const { data } = await axios.post(`${backend}/api/user/login`, {
        googleToken: credential,
      });
      if (data.success) {
        setToken(data.token);
        localStorage.setItem("user-token", data.token);
        toast.success("Logged in with Google");
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Google login failed");
    }
  };

const handleGooglePasswordReset = async (credential) => {
  try {
    const { data } = await axios.post(`${backend}/api/user/verify-google`, {
      googleToken: credential,
    });

    if (data.success) {
      setResetEmail(data.email);
      setState("Reset Password");
      toast.success("Email verified. Please set your new password.");
    } else {
      toast.error(data.message || "Failed to verify email with Google");
    }
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || "Failed to verify email with Google");
  }
};


  return (
    <div className="flex items-center justify-center min-h-screen py-5">
      {/* Main Form */}
      {state !== "Reset Password" ? (
        <form
          onSubmit={onSubmitHandler}
          className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg shadow-zinc-500 bg-white"
        >
          <p className="text-2xl font-semibold">
            {state === "Sign Up"
              ? "Create Account"
              : state === "Forget Password"
              ? "Forget Password"
              : "Login"}
          </p>
          <p className="mt-4">
            {state === "Sign Up"
              ? "Please sign up to place an order"
              : state === "Forget Password"
              ? "Verify your email to reset password"
              : "Please login to place an order"}
          </p>

          {state === "Sign Up" && (
            <div className="w-full">
              <p className="mt-4">Full Name</p>
              <input
                type="text"
                onChange={(e) => setName(e.target.value)}
                value={name}
                required
                className="border border-zinc-500 rounded w-full p-2 mt-1 bg-transparent"
              />
            </div>
          )}

          {state !== "Forget Password" && (
            <>
              <div className="w-full">
                <p className="mt-4">Email</p>
                <input
                  type="email"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  required
                  className="border border-zinc-500 rounded w-full p-2 mt-1 bg-transparent"
                />
              </div>
              <div className="w-full">
                <p className="mt-4">Password</p>
                <input
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  required
                  className="border border-zinc-500 rounded w-full p-2 mt-1 bg-transparent"
                />
              </div>
            </>
          )}

          {state !== "Forget Password" && (
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full border py-3 text-zinc-700 font-medium rounded mt-4 text-[16px] transition-all duration-300 ${
                isLoading
                  ? "bg-orange-300 cursor-not-allowed"
                  : "bg-orange-400 hover:bg-orange-500 hover:text-black hover:scale-105"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-zinc-700"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                    />
                  </svg>
                  {state === "Sign Up" ? "Creating Account..." : "Logging in..."}
                </span>
              ) : state === "Sign Up" ? (
                "Create Account"
              ) : (
                "Login"
              )}
            </button>
          )}

          {/* Google login */}
          {state === "Login" || state === "Forget Password" ? (
            <>
              <p className="text-center font-bold w-full mt-3">or</p>
              <GoogleLogin
                onSuccess={async (response) => {
                  const credential = response.credential || response.access_token;
                  state === "Login"
                    ? handleGoogleLogin(credential)
                    : handleGooglePasswordReset(credential);
                }}
                onError={() => toast.error("Google login failed")}
              />
            </>
          ) : null}

          {/* Switch between login/sign up/reset */}
          {state === "Sign Up" ? (
            <p className="mt-4">
              Already have an account?{" "}
              <span
                onClick={() => setState("Login")}
                className="text-orange-500 underline cursor-pointer"
              >
                Login Here
              </span>
            </p>
          ) : state === "Login" ? (
            <>
              <p className="mt-4">
                Don't have an account?{" "}
                <span
                  onClick={() => setState("Sign Up")}
                  className="text-orange-500 underline cursor-pointer"
                >
                  Sign Up Here
                </span>
              </p>
              <p className="mt-2">
                Forgot your password?{" "}
                <span
                  onClick={() => setState("Forget Password")}
                  className="text-orange-500 underline cursor-pointer"
                >
                  Reset Here
                </span>
              </p>
            </>
          ) : (
            <p className="mt-4">
              Back to{" "}
              <span
                onClick={() => setState("Login")}
                className="text-orange-500 underline cursor-pointer"
              >
                Login
              </span>
            </p>
          )}
        </form>
      ) : (
        /* Reset Password Form */
        <form
          onSubmit={onSubmitHandler}
          className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg shadow-zinc-500 bg-white"
        >
          <p className="text-2xl font-semibold">Reset Password</p>
          <p className="mt-4">Enter your new password</p>
          <div className="w-full">
            <p className="mt-4">New Password</p>
            <input
              type="password"
              onChange={(e) => setNewPassword(e.target.value)}
              value={newPassword}
              required
              className="border border-zinc-500 rounded w-full p-2 mt-1 bg-transparent"
            />
          </div>
          <div className="w-full">
            <p className="mt-4">Confirm New Password</p>
            <input
              type="password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              value={confirmPassword}
              required
              className="border border-zinc-500 rounded w-full p-2 mt-1 bg-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full border py-3 text-zinc-700 font-medium rounded mt-4 text-[16px] transition-all duration-300 ${
              isLoading
                ? "bg-orange-300 cursor-not-allowed"
                : "bg-orange-400 hover:bg-orange-500 hover:text-black hover:scale-105"
            }`}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
          <p className="mt-4 text-center w-full">
            <span
              onClick={() => setState("Login")}
              className="text-orange-500 underline cursor-pointer"
            >
              Back to Login
            </span>
          </p>
        </form>
      )}
    </div>
  );
};

export default Login;
