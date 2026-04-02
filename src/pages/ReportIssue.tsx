import { useState, FormEvent } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  MapPin, 
  FileText, 
  AlertTriangle, 
  Droplets, 
  Trash2, 
  MoreHorizontal,
  Send,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';

interface ReportIssueProps {
  user: UserProfile;
}

export default function ReportIssue({ user }: ReportIssueProps) {
  const [type, setType] = useState<'dirty area' | 'water leakage' | 'garbage' | 'others'>('dirty area');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await addDoc(collection(db, 'issues'), {
        type,
        description,
        location,
        status: 'Pending',
        reportedBy: user.uid,
        reportedByName: user.name,
        timestamp: serverTimestamp(),
      });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to submit issue');
    } finally {
      setLoading(false);
    }
  };

  const types = [
    { id: 'dirty area', label: 'Dirty Area', icon: <AlertTriangle className="w-5 h-5" />, color: 'text-amber-500 bg-amber-50' },
    { id: 'water leakage', label: 'Water Leakage', icon: <Droplets className="w-5 h-5" />, color: 'text-blue-500 bg-blue-50' },
    { id: 'garbage', label: 'Garbage', icon: <Trash2 className="w-5 h-5" />, color: 'text-red-500 bg-red-50' },
    { id: 'others', label: 'Others', icon: <MoreHorizontal className="w-5 h-5" />, color: 'text-gray-500 bg-gray-50' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-blue-50 rounded-full mb-4">
            <PlusCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Report New Issue</h1>
          <p className="text-gray-500 mt-1">Help us keep the campus clean and safe</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Issue Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {types.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id as any)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    type === t.id 
                      ? 'border-blue-600 bg-blue-50 text-blue-600' 
                      : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${type === t.id ? 'bg-white shadow-sm' : ''}`}>
                    {t.icon}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
            <div className="relative">
              <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="e.g. Block A, Room 204, Main Cafeteria"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <div className="relative">
              <FileText className="w-5 h-5 text-gray-400 absolute left-3 top-4" />
              <textarea
                required
                rows={4}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                placeholder="Describe the issue in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Report
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
