import { useUser } from "../contexts/UserContext";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return user ? (
    <nav className="bg-gray-100 p-3 flex gap-4 items-center">
      <span className="text-gray-700">
        Logged in as: <b>{user.email}</b> ({user.role})
      </span>
      <button
        className="text-red-600 border border-red-300 px-3 py-1 rounded hover:bg-red-50"
        onClick={handleLogout}
      >
        Logout
      </button>
    </nav>
  ) : null;
}
