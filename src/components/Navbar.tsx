import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { UserProfile } from '../types';
import { LogOut, PlusCircle, LayoutDashboard, User } from 'lucide-react';

interface NavbarProps {
  user: UserProfile | null;
}

export default function Navbar({ user }: NavbarProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-blue-600 flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6" />
          <span>College Cleaning</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4">
              <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link to="/report" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1">
                <PlusCircle className="w-4 h-4" />
                Report Issue
              </Link>
            </div>

            <div className="flex items-center gap-4 pl-6 border-l">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-gray-900">{user.name}</span>
                <span className="text-xs text-gray-500 capitalize">{user.role}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium">Login</Link>
            <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
