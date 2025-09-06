import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase"; // adjust path as needed
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { name } from './../../node_modules/tar/dist/esm/types';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login successful 💜");
      navigate("/journal"); // redirect to journaling page
    } catch (error) {
      toast.error(error.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-50">
      <div className="bg-white shadow-md p-8 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-purple-700 mb-6">Login</h2>
        <form onSubmit={handleLogin} autoComplete="off">
          <input
            type="email"
            placeholder="Email"
            autoComplete="off"
            name="email"
            className="w-full mb-4 p-3 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            autoComplete="new-password"
            name="password"
            className="w-full mb-4 p-3 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded"
          >
            Login
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <a href="/signup" className="text-purple-600 hover:underline">
            Sign up here
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;