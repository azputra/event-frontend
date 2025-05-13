// src/pages/EventRegistration.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const EventRegistration = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [eventClosed, setEventClosed] = useState(false);
  
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    noHp: '',
    alamat: ''
  });
  
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`https://event-backend-ko3x.onrender.com/api/events/slug/${slug}`);
        setEvent(res.data);
        
        // Check if event date has passed
        const eventDate = new Date(res.data.tanggal);
        const currentDate = new Date();
        
        // Set eventClosed to true if event date is today or has passed
        if (eventDate <= currentDate) {
          setEventClosed(true);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Error fetching event details');
        setLoading(false);
      }
    };
    
    fetchEvent();
  }, [slug]);
  
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      const registrationData = {
        ...formData,
        event: event._id
      };
      
      await axios.post('https://event-backend-ko3x.onrender.com/api/customers', registrationData);
      
      Swal.fire({
        icon: 'success',
        title: 'Pendaftaran Berhasil!',
        text: 'Terima kasih telah mendaftar untuk event ini. Kami akan mengirimkan informasi lebih lanjut melalui email.',
        confirmButtonText: 'OK'
      }).then(() => {
        // navigate('/registration-success');
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Pendaftaran Gagal',
        text: err.response?.data?.message || 'Terjadi kesalahan saat mendaftar'
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-blue-600 animate-spin"></div>
          <p className="mt-6 text-gray-600 font-medium">Loading event details...</p>
        </div>
      </div>
    );
  }
  
  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md">
          <p className="font-medium text-lg">{error || 'Event tidak ditemukan'}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Kembali ke Halaman Utama
          </button>
        </div>
      </div>
    );
  }
  
  // Generate dynamic styles based on event's backgroundColor
  const eventColor = event.backgroundColor || '#3b82f6'; // Default to blue if no color specified
  const buttonGradient = `from-${eventColor}-600 to-${eventColor}-700`;
  const bgStyle = {
    backgroundColor: event.backgroundColor ? `${event.backgroundColor}10` : '#f0f9ff', // Very light version of the color
  };
  
  // For border and accent elements
  const accentStyle = {
    borderColor: eventColor,
    backgroundColor: event.backgroundColor ? `${event.backgroundColor}15` : undefined
  };
  
  return (
    <div className="min-h-screen py-12" style={bgStyle}>
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Event Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 transform transition hover:scale-[1.01]">
            {/* Event Header with dynamic background */}
            <div 
              className="relative py-12 px-8 text-center"
              style={{
                backgroundImage: event.background ? 
                  `linear-gradient(rgba(0, 0, 0, 0.5), ${event.backgroundColor || 'rgba(59, 130, 246, 0.7)'}), url(${event.background})` : 
                  `linear-gradient(135deg, ${eventColor} 0%, ${eventColor}99 100%)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {/* Event color indicator stripe */}
              <div 
                className="absolute top-0 left-0 w-full h-2" 
                style={{backgroundColor: eventColor}}
              ></div>
              
              <div className="relative z-10">
                <span 
                  className="inline-block px-4 py-1 rounded-full bg-white bg-opacity-20 text-sm font-medium mb-4"
                  style={{borderLeft: `3px solid ${eventColor}`}}
                >
                  {new Date(event.tanggal).toLocaleDateString('id-ID', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
                <h1 className="text-4xl font-bold text-white mb-2">{event.nama}</h1>
                
                {/* Event Status Badge */}
                {eventClosed && (
                  <span className="mt-2 inline-block px-4 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                    Pendaftaran Sudah Di Tutup
                  </span>
                )}
                
                <div className="flex items-center justify-center mt-4 text-white">
                  <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{event.lokasi}</span>
                </div>
              </div>
            </div>
            
            {/* Event Description */}
            {event.deskripsi && (
              <div className="p-8 border-b border-gray-200">
                <div className="flex items-center mb-4">
                  <div 
                    className="w-4 h-4 rounded-full mr-2" 
                    style={{backgroundColor: eventColor}}
                  ></div>
                  <h2 className="text-2xl font-bold text-gray-800">Tentang Event</h2>
                </div>
                <div 
                  className="p-4 rounded-lg" 
                  style={accentStyle}
                >
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">{event.deskripsi}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Registration Form or Closed Message */}
          {eventClosed ? (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-8 text-center">
                <div className="mb-6">
                  <div className="mx-auto w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-10 h-10 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Pendaftaran Ditutup</h2>
                <p className="text-gray-600 mb-6">
                  Maaf, pendaftaran untuk event ini telah ditutup karena event sedang berlangsung atau telah selesai.
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Kembali ke Halaman Utama
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center">
                    <div 
                      className="w-3 h-12 rounded-full mr-3" 
                      style={{backgroundColor: eventColor}}
                    ></div>
                    <h2 className="text-3xl font-bold text-gray-800">Form Pendaftaran</h2>
                  </div>
                  <p className="text-gray-500 mt-2">Silahkan isi data diri Anda untuk mendaftar event ini</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="form-group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="nama"
                        value={formData.nama}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                        style={{
                          "--tw-ring-color": eventColor,
                        }}
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                        style={{
                          "--tw-ring-color": eventColor,
                        }}
                        placeholder="Masukkan alamat email"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nomor Telepon
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <input
                        type="number"
                        name="noHp"
                        value={formData.noHp}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                        style={{
                          "--tw-ring-color": eventColor,
                        }}
                        placeholder="Masukkan nomor telepon/WA"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Alamat
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <textarea
                        name="alamat"
                        value={formData.alamat}
                        onChange={handleInputChange}
                        required
                        rows="3"
                        className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                        style={{
                          "--tw-ring-color": eventColor,
                        }}
                        placeholder="Masukkan alamat lengkap"
                      ></textarea>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full px-6 py-4 text-white border border-transparent rounded-lg shadow-sm focus:outline-none focus:ring-4 focus:ring-opacity-30 font-semibold text-lg transition-all transform hover:scale-[1.01] flex items-center justify-center"
                      style={{
                        background: `linear-gradient(to right, ${eventColor}, ${eventColor}dd)`,
                        "--tw-ring-color": `${eventColor}50`,
                      }}
                    >
                      {submitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Mendaftar...
                        </>
                      ) : (
                        <>
                          Daftar Sekarang
                          <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
              
              {/* Footer */}
              <div 
                className="px-8 py-4 text-center text-sm border-t"
                style={{
                  backgroundColor: `${eventColor}10`,
                  borderColor: `${eventColor}30`,
                  color: `${eventColor}DD`
                }}
              >
                <p>Dengan mendaftar, Anda menyetujui syarat dan ketentuan yang berlaku</p>
              </div>
            </div>
          )}
          
          {/* Additional Information */}
          <div 
            className="mt-8 text-center text-sm"
            style={{ color: `${eventColor}DD` }}
          >
            <p>Butuh bantuan? Hubungi kami di <span className="font-semibold">help@eventorganizer.com</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventRegistration;