import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, Issue } from '../types';
import { 
  Clock, 
  CheckCircle2, 
  MapPin, 
  AlertTriangle, 
  Droplets, 
  Trash2, 
  MoreHorizontal,
  Calendar,
  User,
  Search,
  Filter,
  Check
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DashboardProps {
  user: UserProfile;
}

export default function Dashboard({ user }: DashboardProps) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Completed'>('All');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [completionNote, setCompletionNote] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'issues'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const issuesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Issue[];
      setIssues(issuesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (issueId: string) => {
    try {
      await updateDoc(doc(db, 'issues', issueId), {
        status: 'Completed',
        completionNote: completionNote || 'Issue resolved by cleaning staff.'
      });
      setUpdatingId(null);
      setCompletionNote('');
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = 
      issue.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || issue.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'dirty area': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'water leakage': return <Droplets className="w-5 h-5 text-blue-500" />;
      case 'garbage': return <Trash2 className="w-5 h-5 text-red-500" />;
      default: return <MoreHorizontal className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Issue Dashboard</h1>
          <p className="text-gray-500">Track and manage cleaning requests across campus</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search location..."
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              className="pl-10 pr-8 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredIssues.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-300 text-center">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No issues found</h3>
            <p className="text-gray-500">Try adjusting your search or filter</p>
          </div>
        ) : (
          filteredIssues.map((issue) => (
            <div 
              key={issue.id} 
              className={cn(
                "bg-white rounded-2xl border transition-all hover:shadow-md overflow-hidden",
                issue.status === 'Completed' ? "border-green-100" : "border-gray-200"
              )}
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        issue.status === 'Completed' ? "bg-green-50" : "bg-gray-50"
                      )}>
                        {getIcon(issue.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 capitalize">{issue.type}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="w-4 h-4" />
                          <span>{issue.location}</span>
                        </div>
                      </div>
                      <div className={cn(
                        "ml-auto sm:ml-0 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                        issue.status === 'Completed' 
                          ? "bg-green-100 text-green-700" 
                          : "bg-amber-100 text-amber-700"
                      )}>
                        {issue.status}
                      </div>
                    </div>

                    <p className="text-gray-600 leading-relaxed">{issue.description}</p>

                    <div className="flex flex-wrap gap-4 pt-2 border-t border-gray-50 mt-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <User className="w-4 h-4" />
                        <span>Reported by: <span className="font-medium text-gray-700">{issue.reportedByName}</span></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{issue.timestamp?.toDate().toLocaleString()}</span>
                      </div>
                    </div>

                    {issue.status === 'Completed' && issue.completionNote && (
                      <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-100">
                        <div className="flex items-center gap-2 text-green-700 font-semibold text-sm mb-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Resolution
                        </div>
                        <p className="text-sm text-green-600">{issue.completionNote}</p>
                      </div>
                    )}
                  </div>

                  {user.role === 'cleaning staff' && issue.status === 'Pending' && (
                    <div className="lg:w-72 space-y-3">
                      {updatingId === issue.id ? (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                          <textarea
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Add a completion note..."
                            rows={3}
                            value={completionNote}
                            onChange={(e) => setCompletionNote(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateStatus(issue.id)}
                              className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                            >
                              <Check className="w-4 h-4" />
                              Complete
                            </button>
                            <button
                              onClick={() => setUpdatingId(null)}
                              className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setUpdatingId(issue.id)}
                          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          Mark as Completed
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
