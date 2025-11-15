import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Edit, Save, Calendar, Clock, Code } from 'lucide-react';
import { api } from '../context/AuthContext';
import { Header } from '../components/Header';

interface Reservation {
  reservation_id: number;
  restaurant: {
    restaurant_name: string;
  };
  reservation_date: string;
  reservation_time: string;
  number_of_guests: number;
  status: string;
  reservation_code: string;
}

export function ProfilePage() {
  const { user, isAuthenticated, logout, updateUserProfile, fetchUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [preferences, setPreferences] = useState('');
  const navigate = useNavigate();
  const [greetingVisible, setGreetingVisible] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    preferences: '',
  });

  async function loadUserData(apiInstance: any) {
    try {
      setIsLoading(true);
      const userData = await fetchUserProfile();
      setFormData({
        name: userData.name,
        email: userData.email,
        preferences: userData.preferences || '',
      });

      setPreferences(userData.preferences || '');

      const reservationsResponse = await apiInstance.get('/my-reservations/');
      setReservations(reservationsResponse.data || []);
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Failed to load user data. Please try again.');
    } finally {
      setIsLoading(false);
      // small delay for greeting animation
      setTimeout(() => setGreetingVisible(true), 350);
    }
  }

  useEffect(() => {
    loadUserData(api);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate, fetchUserProfile]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      await updateUserProfile(formData);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again later.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCancelReservation = async (reservationId: number) => {
    try {
      await api.delete(`/my-reservations/${reservationId}`);

      setReservations((prev) =>
        prev.map((res) => (res.reservation_id === reservationId ? { ...res, status: 'Cancelled' } : res))
      );

      setSuccessMessage('Reservation cancelled successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error cancelling reservation:', err);
      setError('Failed to cancel reservation. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Skeleton loader component
  const SkeletonCard = () => (
    <div className="animate-pulse bg-white/40 rounded-xl p-6">
      <div className="h-6 bg-white/60 rounded mb-4 w-1/3" />
      <div className="h-4 bg-white/60 rounded mb-2 w-2/3" />
      <div className="h-4 bg-white/60 rounded w-1/2 mt-2" />
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-red-50 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          <div className="mb-6">
            <div className="h-12 w-12 rounded-full bg-purple-200/60 mx-auto mb-4 animate-pulse" />
            <div className="h-8 bg-white/50 rounded mb-2" />
            <div className="h-4 bg-white/40 rounded w-3/4 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-red-50 relative">
      <Header />

      {/* Floating subtle shapes */}
      <div aria-hidden className="pointer-events-none absolute -left-20 top-10 w-72 h-72 rounded-full bg-purple-300/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute right-10 top-40 w-56 h-56 rounded-full bg-pink-300/8 blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="relative bg-white/60 backdrop-blur-lg rounded-xl shadow-md overflow-hidden border border-white/20">

              <div className="px-6 py-8" style={{ background: 'linear-gradient(90deg, rgba(124,58,237,0.9), rgba(239,68,68,0.9))' }}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center">
                        <User className="h-8 w-8 text-purple-600" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-white/70 flex items-center justify-center text-xs text-purple-600 shadow">✓</div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
                      <p className="text-purple-100 opacity-90">Culinary Enthusiast</p>
                    </div>
                  </div>
                  {!isEditing ? (
                    <button
                      onClick={handleEdit}
                      className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
                      aria-label="Edit profile"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSave}
                      className="bg-white text-purple-600 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                      aria-label="Save profile"
                    >
                      <Save className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="px-6 py-6">
                {!isEditing ? (
                  <div className="space-y-4 transition-all duration-300">
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-800">{user?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tell Your Choices</p>
                      <p className="text-gray-800">{preferences || 'No choices yet given!!'}</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSave} className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Tell Your Choices</label>
                      <textarea
                        name="preferences"
                        value={formData.preferences}
                        onChange={handleChange}
                        placeholder="Tell us about your food preferences, dietary restrictions, etc."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows={3}
                      />
                    </div>
                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <div className="px-6 py-4 border-t border-white/10">
                <button
                  onClick={logout}
                  className="w-full bg-red-100 text-red-600 py-2 px-4 rounded-lg hover:bg-red-200 transition-colors font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Reservations */}
            <div className="bg-white/60 backdrop-blur-lg rounded-xl shadow-md overflow-hidden border border-white/10">
              <div className="px-6 py-5 border-b border-white/10 bg-white/30">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">My Reservations</h3>
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
              </div>

              {reservations.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <p className="text-gray-500 mb-4">You don't have any reservations yet.</p>
                  <button
                    onClick={() => navigate('/chat')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
                  >
                    Book a Restaurant
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {reservations.map((reservation) => (
                    <div
                      key={reservation.reservation_id}
                      className="px-6 py-4 transition-transform duration-200 hover:scale-[1.01]"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">{reservation.restaurant.restaurant_name}</h4>
                          <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                              {formatDate(reservation.reservation_date)}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-gray-500" />
                              {formatTime(reservation.reservation_time)}
                            </div>
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-1 text-gray-500" />
                              {reservation.number_of_guests} {reservation.number_of_guests === 1 ? 'guest' : 'guests'}
                            </div>
                            {reservation.reservation_code && (
                              <div className="flex items-center">
                                <Code className="h-4 w-4 mr-1 text-gray-500" />
                                <span className="text-sm text-gray-600 bg-white/40 px-2 py-1 rounded">{reservation.reservation_code}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              reservation.status === 'Confirmed'
                                ? 'bg-green-100 text-green-800 border border-green-200/60 backdrop-blur-sm'
                                : reservation.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200/60 backdrop-blur-sm'
                                : 'bg-red-100 text-red-800 border border-red-200/60 backdrop-blur-sm'
                            }`}
                          >
                            {reservation.status}
                          </span>

                          {reservation.status !== 'Cancelled' && (
                            <button
                              onClick={() => handleCancelReservation(reservation.reservation_id)}
                              className="text-xs text-red-600 hover:text-red-800 font-medium"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/chat')}
                className="w-full bg-white/60 backdrop-blur-sm hover:bg-white/70 transition-colors rounded-lg p-4 flex items-center gap-3 shadow-sm"
              >
                <Calendar className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Book a table</p>
                  <p className="font-medium text-gray-900">Reserve Now</p>
                </div>
              </button>

              <button
                onClick={() => window.print()}
                className="w-full bg-white/60 backdrop-blur-sm hover:bg-white/70 transition-colors rounded-lg p-4 flex items-center gap-3 shadow-sm"
              >
                <Code className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Export</p>
                  <p className="font-medium text-gray-900">Download</p>
                </div>
              </button>

              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-white/60 backdrop-blur-sm hover:bg-white/70 transition-colors rounded-lg p-4 flex items-center gap-3 shadow-sm"
              >
                <Edit className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Profile</p>
                  <p className="font-medium text-gray-900">Edit Details</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
