"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface RequestData {
  id: string;
  userId: string;
  userEmail: string;
  type: string;
  title?: string;
  genre?: string;
  game?: string;
  url?: string;
  public_id?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

export default function AdminRequests() {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'requests'));
      const reqs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as RequestData[];
      setRequests(reqs);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const request = requests.find(r => r.id === id);
      if (!request) return;

      if (status === 'approved' && request.type === 'image_upload') {
        // Move approved image to images collection
        await addDoc(collection(db, 'images'), {
          title: request.title,
          genre: request.genre,
          game: request.game,
          url: request.url,
          public_id: request.public_id,
          uploadedAt: request.createdAt,
          likes: 0,
          dislikes: 0,
          likedBy: [],
          dislikedBy: [],
        });
        // Delete from requests
        await deleteDoc(doc(db, 'requests', id));
        setRequests(prev => prev.filter(req => req.id !== id));
      } else {
        // Just update status for rejection
        await updateDoc(doc(db, 'requests', id), { status });
        setRequests(prev => prev.map(req =>
          req.id === id ? { ...req, status } : req
        ));
      }
    } catch (error) {
      console.error('Error updating request:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-white">Loading requests...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-white mb-6">User Requests</h1>

      {requests.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          No requests found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request) => (
            <div key={request.id} className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {request.type === 'image_upload' ? 'Image Upload Request' : `${request.type} Request`}
                  </h3>
                  <p className="text-gray-300 mb-2">
                    From: {request.userEmail}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {request.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  request.status === 'pending'
                    ? 'bg-yellow-600 text-yellow-100'
                    : request.status === 'approved'
                    ? 'bg-green-600 text-green-100'
                    : 'bg-red-600 text-red-100'
                }`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </div>
              </div>

              {request.type === 'image_upload' ? (
                <div className="mb-4">
                  {request.url && (
                    <img
                      src={request.url}
                      alt={request.title}
                      className="w-full max-w-sm h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <div className="space-y-2">
                    <p className="text-gray-300"><strong>Title:</strong> {request.title}</p>
                    <p className="text-gray-300"><strong>Genre:</strong> {request.genre}</p>
                    <p className="text-gray-300"><strong>Game:</strong> {request.game}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-300 mb-4">General request</p>
              )}

              {request.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => updateRequestStatus(request.id, 'approved')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => updateRequestStatus(request.id, 'rejected')}
                    variant="destructive"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}