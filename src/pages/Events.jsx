// src/pages/Events.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import RegistrationLinkDisplay from '../components/RegistrationLinkDisplay';
import AddEventModal from '../components/AddEventModal'; // Import komponen baru

// Komponen ColorPicker pindah ke file terpisah components/ColorPicker.js

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form state
  const [showModal, setShowModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null); // Untuk edit event
  const [submitting, setSubmitting] = useState(false);
  
  // Search state
  const [searchText, setSearchText] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axios.get('https://event-backend-85661116f5a4.herokuapp.com/api/events');
      setEvents(res.data);
      setLoading(false);
    } catch (err) {
      setError('Error fetching events');
      setLoading(false);
    }
  };

  const handleSubmit = async (eventData) => {
    try {
      setSubmitting(true);
      
      if (currentEvent?._id) {
        // Update existing event
        const res = await axios.put(`https://event-backend-85661116f5a4.herokuapp.com/api/events/${currentEvent._id}`, eventData);
        
        // Update events list
        setEvents(events.map(event => event._id === currentEvent._id ? res.data : event));
        
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Event berhasil diperbarui',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        // Create new event
        const res = await axios.post('https://event-backend-85661116f5a4.herokuapp.com/api/events', eventData);
        
        // Add to events list
        setEvents([...events, res.data]);
        
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Event baru telah ditambahkan',
          timer: 1500,
          showConfirmButton: false
        });
      }
      
      // Close modal and reset
      closeModal();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: err.response?.data?.message || 'Error processing event'
      });
      setError('Error processing event');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Event yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`https://event-backend-85661116f5a4.herokuapp.com/api/events/${id}`);
          setEvents(events.filter(event => event._id !== id));
          
          Swal.fire({
            icon: 'success',
            title: 'Dihapus!',
            text: 'Event berhasil dihapus.',
            timer: 1500,
            showConfirmButton: false
          });
        } catch (err) {
          Swal.fire({
            icon: 'error',
            title: 'Gagal!',
            text: 'Terjadi kesalahan saat menghapus event.'
          });
        }
      }
    });
  };
  
  const handleEdit = (event) => {
    setCurrentEvent(event);
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
    setCurrentEvent(null);
  };
  
  // Filter & search function
  const filteredEvents = events.filter(event => {
    const textMatch = searchText === '' || 
                     event.nama.toLowerCase().includes(searchText.toLowerCase()) ||
                     event.lokasi.toLowerCase().includes(searchText.toLowerCase()) ||
                     (event.deskripsi && event.deskripsi.toLowerCase().includes(searchText.toLowerCase()));
    
    let dateMatch = true;
    if (dateFilter) {
      const today = new Date();
      const eventDate = new Date(event.tanggal);
      
      switch(dateFilter) {
        case 'upcoming':
          dateMatch = eventDate >= today;
          break;
        case 'past':
          dateMatch = eventDate < today;
          break;
        case 'thisMonth':
          dateMatch = eventDate.getMonth() === today.getMonth() && 
                      eventDate.getFullYear() === today.getFullYear();
          break;
        case 'nextMonth':
          const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
          dateMatch = eventDate.getMonth() === nextMonth.getMonth() && 
                      eventDate.getFullYear() === nextMonth.getFullYear();
          break;
        default:
          dateMatch = true;
      }
    }
    
    return textMatch && dateMatch;
  });
  
  // Sort events by date (most recent first)
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    return new Date(a.tanggal) - new Date(b.tanggal);
  });
  
  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedEvents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedEvents.length / itemsPerPage);
  
  // Page change handler
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Function to determine event status
  const getEventStatus = (eventDate) => {
    const date = new Date(eventDate);
    const today = new Date();
    
    // Reset hours, minutes, seconds and milliseconds for accurate date comparison
    const eventDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    if (eventDay.getTime() === todayDay.getTime()) {
      return {
        label: 'Berlangsung',
        className: 'bg-green-100 text-green-800',
        upcoming: true
      };
    } else if (eventDay > todayDay) {
      return {
        label: 'Mendatang',
        className: 'bg-blue-100 text-blue-800',
        upcoming: true
      };
    } else {
      return {
        label: 'Selesai',
        className: 'bg-gray-100 text-gray-800',
        upcoming: false
      };
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-t-4 border-blue-500 border-opacity-50 animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Daftar Event</h1>
        
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2 px-6 rounded-full shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Tambah Event
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md mb-6 animate-fadeIn">
          <div className="flex">
            <div className="py-1">
              <svg className="h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Event Modal */}
      <AddEventModal 
        isOpen={showModal}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initialData={currentEvent || {}}
        submitting={submitting}
      />
      
      {/* Search & Filter Bar */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cari Event
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Nama event, lokasi, atau deskripsi"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter Tanggal
            </label>
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Semua Tanggal</option>
              <option value="upcoming">Event Mendatang</option>
              <option value="past">Event Sebelumnya</option>
              <option value="thisMonth">Bulan Ini</option>
              <option value="nextMonth">Bulan Depan</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Results Counter */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">
          {sortedEvents.length === 0 
            ? 'Tidak ada event yang ditemukan' 
            : `Menampilkan ${sortedEvents.length} event`}
        </p>
        
        {sortedEvents.length > itemsPerPage && (
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value={6}>6 / halaman</option>
            <option value={12}>12 / halaman</option>
            <option value={24}>24 / halaman</option>
          </select>
        )}
      </div>
      
      {/* Event Cards */}
      {sortedEvents.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada event</h3>
          <p className="text-gray-500">Tidak ada event yang sesuai dengan filter yang dipilih.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentItems.map((event) => {
            const status = getEventStatus(event.tanggal);
            
            return (
              <div 
                key={event._id} 
                className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border-l-4 ${
                  status.upcoming ? 'border-blue-500' : 'border-gray-400'
                }`}
                style={{
                  backgroundColor: event.backgroundColor ? `${event.backgroundColor}15` : undefined // 15 for 10% opacity
                }}
              >
                {/* Tambahkan display gambar jika ada */}
                {event.hasBackgroundImage && (
                  <div 
                    className="h-40 w-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url(https://event-backend-85661116f5a4.herokuapp.com/api/events/image/${event._id})`,
                    }}
                  >
                    <div 
                      className="h-full w-full flex items-end justify-end p-2" 
                      style={{
                        background: `linear-gradient(transparent, ${event.backgroundColor || '#3b82f6'}80)`
                      }}
                    >
                      <span 
                        className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${status.upcoming ? 'bg-blue-500' : 'bg-gray-400'}`}
                      >
                        {status.label}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{event.nama}</h3>
                      <div className="flex items-center text-gray-500 mb-1">
                        <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm">
                          {new Date(event.tanggal).toLocaleDateString('id-ID', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm">{event.lokasi}</span>
                      </div>
                    </div>
                    
                    {!event.hasBackgroundImage && (
                      <span 
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    )}
                  </div>
                  
                  {event.deskripsi && (
                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <p className="text-gray-600 text-sm line-clamp-3">{event.deskripsi}</p>
                    </div>
                  )}
                  
                  {status.upcoming && (
                    <div className="mt-4">
                      <RegistrationLinkDisplay event={event} />
                    </div>
                  )}
                  
                  <div className="flex justify-end mt-6 gap-4">
                    <button
                      onClick={() => handleEdit(event)}
                      className="ml-2 text-blue-500 hover:text-blue-700 transition-colors inline-flex items-center"
                    >
                      <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 0L11.828 15.9a2 2 0 01-.707.707l-4 1a2 2 0 01-2.414-2.414l1-4a2 2 0 01.707-.707z" />
                      </svg>
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(event._id)}
                      className="text-red-500 hover:text-red-700 transition-colors inline-flex items-center"
                    >
                      <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-10">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-3 py-2 rounded-l-md border ${
                currentPage === 1
                  ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 bg-white text-gray-500 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <span className="sr-only">First</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-3 py-2 border ${
                currentPage === 1
                  ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 bg-white text-gray-500 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {[...Array(totalPages)].map((_, index) => {
              const pageNum = index + 1;
              // Only show current page, first page, last page, and pages around current
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 border ${
                      currentPage === pageNum
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600 font-medium'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
              
              // Add ellipsis if needed
              if (
                (pageNum === 2 && currentPage > 3) ||
                (pageNum === totalPages - 1 && currentPage < totalPages - 2)
              ) {
                return (
                  <span
                    key={`ellipsis-${pageNum}`}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700"
                  >
                    ...
                  </span>
                );
              }
              
              return null;
            })}
            
            <button
              onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-3 py-2 border ${
                currentPage === totalPages
                  ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 bg-white text-gray-500 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <span className="sr-only">Next</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-3 py-2 rounded-r-md border ${
                currentPage === totalPages
                  ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 bg-white text-gray-500 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <span className="sr-only">Last</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Events;