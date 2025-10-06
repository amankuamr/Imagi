"use client";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ImageData {
  id: string;
  title: string;
  url: string;
  public_id: string;
  uploadedAt: any;
}

export default function AdminPage() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'images'));
      const imgs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ImageData));
      setImages(imgs);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadName) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', uploadFile);
    formData.append('name', uploadName);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        alert('Image uploaded successfully!');
        setUploadName('');
        setUploadFile(null);
        fetchImages(); // Refresh list
      } else {
        alert('Upload failed');
      }
    } catch (error) {
      alert('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (public_id: string, doc_id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const res = await fetch('/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_id, doc_id }),
      });

      if (res.ok) {
        alert('Image deleted successfully!');
        fetchImages(); // Refresh list
      } else {
        alert('Delete failed');
      }
    } catch (error) {
      alert('Error deleting image');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-6">Admin Panel - Manage Images</h1>
        
        {/* Upload Form */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-white">Upload New Image</h2>
          <form onSubmit={handleUpload}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Image Name</label>
                <input
                  type="text"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  placeholder="Enter image name"
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Image File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={uploading}
              className="w-full md:w-auto bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-600 transition-colors"
            >
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
          </form>
        </div>
        
        {/* Images List */}
        <h2 className="text-2xl font-semibold mb-4 text-white">Uploaded Images</h2>
        {loading ? (
          <p className="text-gray-400">Loading images...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((img) => (
              <div key={img.id} className="bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-700">
                <img src={img.url} alt={img.title} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">{img.title}</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Uploaded: {img.uploadedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                  </p>
                  <button
                    onClick={() => handleDelete(img.public_id, img.id)}
                    className="w-full bg-red-600 text-white py-2 px-3 rounded-md hover:bg-red-700 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {images.length === 0 && !loading && (
          <p className="text-center text-gray-400 mt-10">No images uploaded yet.</p>
        )}
      </div>
    </div>
  );
}
