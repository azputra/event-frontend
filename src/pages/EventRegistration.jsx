// src/pages/EventRegistration.js - Dengan dukungan customFields

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
  const [validationErrors, setValidationErrors] = useState({});
  const [participantCount, setParticipantCount] = useState(0);

  // Initialize formData with empty values for fixed fields
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
        const res = await axios.get(`https://event-backend-85661116f5a4.herokuapp.com/api/events/slug/${slug}`);
        setEvent(res.data);

        const countRes = await axios.get(`https://event-backend-85661116f5a4.herokuapp.com/api/events/${res.data._id}/count`);
        setParticipantCount(countRes.data.count);

        if (countRes.data.count >= 1700) {
          setEventClosed(true);
        }
        
        // Initialize formData with event ID
        setFormData(prevData => ({
          ...prevData,
          event: res.data._id
        }));
        
        // Initialize custom fields in formData
        if (res.data.customFields && res.data.customFields.length > 0) {
          const customFieldsData = {};
          
          res.data.customFields.forEach(field => {
            // Initialize with appropriate empty value based on field type
            customFieldsData[field.fieldId] = field.type === 'checkbox' ? [] : '';
          });
          
          setFormData(prevData => ({
            ...prevData,
            ...customFieldsData
          }));
        }
        
        // Check if event has passed
        const eventDate = new Date(res.data.tanggal);
        const currentDate = new Date();
        
        eventDate.setHours(0, 0, 0, 0);
        currentDate.setHours(0, 0, 0, 0);
        
        if (currentDate > eventDate) {
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
    const { name, value, type, checked } = e.target;
    
    // Handle checkboxes (multiple selection)
    if (type === 'checkbox') {
      const fieldId = name.split('-')[0]; // Format: fieldId-optionIndex
      const updatedValues = [...(formData[fieldId] || [])];
      
      if (checked) {
        updatedValues.push(value);
      } else {
        const index = updatedValues.indexOf(value);
        if (index > -1) {
          updatedValues.splice(index, 1);
        }
      }
      
      setFormData({
        ...formData,
        [fieldId]: updatedValues
      });
      
      // Clear validation error if field now has a value
      if (updatedValues.length > 0 && validationErrors[fieldId]) {
        setValidationErrors({
          ...validationErrors,
          [fieldId]: null
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
      
      // Clear validation error if field now has a value
      if (value && validationErrors[name]) {
        setValidationErrors({
          ...validationErrors,
          [name]: null
        });
      }
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    // Validate required fixed fields
    if (!formData.nama.trim()) errors.nama = 'Nama wajib diisi';
    if (!formData.email.trim()) {
      errors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Format email tidak valid';
    }
    if (!formData.noHp.trim()) errors.noHp = 'Nomor hp wajib diisi';
    if (!formData.alamat.trim()) errors.alamat = 'Alamat wajib diisi';
    
    // Validate required custom fields
    if (event.customFields && event.customFields.length > 0) {
      event.customFields.forEach(field => {
        if (field.required) {
          const value = formData[field.fieldId];
          if (!value || (Array.isArray(value) && value.length === 0) || (typeof value === 'string' && !value.trim())) {
            errors[field.fieldId] = `${field.label} wajib diisi`;
          }
        }
      });
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector('.error-message');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    try {
      setSubmitting(true);
      
      await axios.post('https://event-backend-85661116f5a4.herokuapp.com/api/customers', formData);
      
      Swal.fire({
        icon: 'success',
        title: 'Pendaftaran Berhasil!',
        text: 'Terima kasih telah mendaftar untuk event ini. Kami telah mengirimkan informasi lebih lanjut melalui email/whatsapp.',
        confirmButtonText: 'OK'
      }).then(() => {
        navigate('/registration-success', { 
          state: { 
            noHp: formData.noHp,
            email: formData.email, 
            eventName: event.nama 
          }
        });
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
  
  // Fungsi untuk render form field berdasarkan tipe
  const renderCustomField = (field) => {
    const isInvalid = validationErrors[field.fieldId];
    
    switch (field.type) {
      case 'text':
        return (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <input
              type="text"
              name={field.fieldId}
              value={formData[field.fieldId] || ''}
              onChange={handleInputChange}
              required={field.required}
              className={`w-full pl-10 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                isInvalid ? 'border-red-500' : 'border-gray-300'
              }`}
              style={{
                "--tw-ring-color": event.backgroundColor || '#3b82f6',
              }}
              placeholder={field.placeholder || `Masukkan ${field.label.toLowerCase()}`}
            />
            {isInvalid && (
              <p className="mt-1 text-sm text-red-600 error-message">{isInvalid}</p>
            )}
          </div>
        );
        
      case 'textarea':
        return (
          <div className="relative">
            <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <textarea
              name={field.fieldId}
              value={formData[field.fieldId] || ''}
              onChange={handleInputChange}
              required={field.required}
              rows="3"
              className={`w-full pl-10 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                isInvalid ? 'border-red-500' : 'border-gray-300'
              }`}
              style={{
                "--tw-ring-color": event.backgroundColor || '#3b82f6',
              }}
              placeholder={field.placeholder || `Masukkan ${field.label.toLowerCase()}`}
            ></textarea>
            {isInvalid && (
              <p className="mt-1 text-sm text-red-600 error-message">{isInvalid}</p>
            )}
          </div>
        );
        
      case 'select':
        return (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
            </div>
            <select
              name={field.fieldId}
              value={formData[field.fieldId] || ''}
              onChange={handleInputChange}
              required={field.required}
              className={`w-full pl-10 px-4 py-3 border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                isInvalid ? 'border-red-500' : 'border-gray-300'
              }`}
              style={{
                "--tw-ring-color": event.backgroundColor || '#3b82f6',
              }}
            >
              <option value="">{field.placeholder || `Pilih ${field.label.toLowerCase()}`}</option>
              {field.options.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {/* Custom dropdown arrow */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
              </svg>
            </div>
            {isInvalid && (
              <p className="mt-1 text-sm text-red-600 error-message">{isInvalid}</p>
            )}
          </div>
        );
        
      case 'radio':
        return (
          <div>
            <div className="mt-2 space-y-2">
              {field.options.map((option, index) => (
                <div key={index} className="flex items-center">
                  <input
                    id={`${field.fieldId}-${index}`}
                    name={field.fieldId}
                    type="radio"
                    value={option}
                    checked={formData[field.fieldId] === option}
                    onChange={handleInputChange}
                    required={field.required && index === 0} // Only mark first option as required for HTML validation
                    className={`h-4 w-4 focus:ring-2 focus:ring-offset-2`}
                    style={{
                      "--tw-ring-color": event.backgroundColor || '#3b82f6',
                      "borderColor": isInvalid ? 'rgb(239, 68, 68)' : undefined
                    }}
                  />
                  <label htmlFor={`${field.fieldId}-${index}`} className="ml-3 text-sm text-gray-700">
                    {option}
                  </label>
                </div>
              ))}
            </div>
            {isInvalid && (
              <p className="mt-1 text-sm text-red-600 error-message">{isInvalid}</p>
            )}
          </div>
        );
        
      case 'checkbox':
        return (
          <div>
            <div className="mt-2 space-y-2">
              {field.options.map((option, index) => (
                <div key={index} className="flex items-center">
                  <input
                    id={`${field.fieldId}-${index}`}
                    name={`${field.fieldId}-${index}`}
                    type="checkbox"
                    value={option}
                    checked={formData[field.fieldId]?.includes(option) || false}
                    onChange={handleInputChange}
                    className={`h-4 w-4 rounded focus:ring-2 focus:ring-offset-2`}
                    style={{
                      "--tw-ring-color": event.backgroundColor || '#3b82f6',
                      "borderColor": isInvalid ? 'rgb(239, 68, 68)' : undefined
                    }}
                  />
                  <label htmlFor={`${field.fieldId}-${index}`} className="ml-3 text-sm text-gray-700">
                    {option}
                  </label>
                </div>
              ))}
            </div>
            {isInvalid && (
              <p className="mt-1 text-sm text-red-600 error-message">{isInvalid}</p>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  // Lanjutkan dengan kode render yang sudah ada...
  
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
  const bgStyle = {
    backgroundColor: event.backgroundColor ? `${event.backgroundColor}10` : '#f0f9ff', // Very light version of the color
  };
  
  // For border and accent elements
  const accentStyle = {
    borderColor: eventColor,
    backgroundColor: event.backgroundColor ? `${event.backgroundColor}15` : undefined
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* The actual background image with appropriate sizing */}
        <div 
          style={{
            backgroundImage: event.backgroundImage ? 
              `url(data:${event.backgroundImageType || 'image/jpeg'};base64,${event.backgroundImage})` : 
              `linear-gradient(135deg, ${eventColor} 0%, ${eventColor}99 100%)`,
            backgroundSize: 'contain', // Use cover to ensure it fills the screen
            backgroundPosition: 'center',
            width: '100%',
            height: '100%',
            // This transform-origin and transform helps ensure the important parts of the image stay visible
            transformOrigin: 'center',
            transform: 'scale(1.05)', // Slight scale up to avoid white edges
          }}
        ></div>
      </div>
      <div className="min-h-screen py-12 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Event Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 transform transition hover:scale-[1.01]">
              {/* Event Header with dynamic background - Kode yang sudah ada */}
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
                    className="inline-block px-4 py-1 rounded-full bg-white opacity-90 text-sm font-medium mb-4"
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
              
              {/* Event Description - Kode yang sudah ada */}
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
            
            {/* Registration Form atau Closed Message - Update dengan custom fields */}
            {eventClosed ? (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden opacity-90">
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
                    Maaf, pendaftaran untuk event ini telah ditutup karena telah mencapai batas / event telah selesai.
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
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden opacity-90">
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
                  
                  {/* Pesan validasi */}
                  {Object.keys(validationErrors).length > 0 && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-red-800">
                            Mohon perbaiki kesalahan berikut untuk melanjutkan:
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Fixed Fields - Kode yang sudah ada */}
                    <div className="form-group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nama Lengkap <span className="text-red-500">*</span>
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
                          className={`w-full pl-10 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                            validationErrors.nama ? 'border-red-500' : 'border-gray-300'
                          }`}
                          style={{
                            "--tw-ring-color": eventColor,
                          }}
                          placeholder="Masukkan nama lengkap"
                        />
                      </div>
                      {validationErrors.nama && (
                        <p className="mt-1 text-sm text-red-600 error-message">{validationErrors.nama}</p>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
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
                          className={`w-full pl-10 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                            validationErrors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                          style={{
                            "--tw-ring-color": eventColor,
                          }}
                          placeholder="Masukkan alamat email"
                        />
                      </div>
                      {validationErrors.email && (
                        <p className="mt-1 text-sm text-red-600 error-message">{validationErrors.email}</p>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nomor Whatsapp <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          name="noHp"
                          value={formData.noHp}
                          onChange={handleInputChange}
                          required
                          className={`w-full pl-10 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                            validationErrors.noHp ? 'border-red-500' : 'border-gray-300'
                          }`}
                          style={{
                            "--tw-ring-color": eventColor,
                          }}
                          placeholder="Masukkan nomor WA"
                        />
                      </div>
                      {validationErrors.noHp && (
                        <p className="mt-1 text-sm text-red-600 error-message">{validationErrors.noHp}</p>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Alamat <span className="text-red-500">*</span>
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
                          className={`w-full pl-10 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                            validationErrors.alamat ? 'border-red-500' : 'border-gray-300'
                          }`}
                          style={{
                            "--tw-ring-color": eventColor,
                          }}
                          placeholder="Masukkan alamat lengkap"
                        ></textarea>
                      </div>
                      {validationErrors.alamat && (
                        <p className="mt-1 text-sm text-red-600 error-message">{validationErrors.alamat}</p>
                      )}
                    </div>
                    
                    {/* Custom Fields - Tambahkan di sini */}
                    {event.customFields && event.customFields.length > 0 && (
                      <>
                        {/* <div className="flex items-center mb-6">
                          <h3 className="text-xl font-bold text-gray-800">Informasi Tambahan</h3>
                        </div> */}
                        
                        <div className="space-y-6">
                          {event.customFields.map((field) => (
                            <div key={field.fieldId} className="form-group">
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                {field.label} {field.required && <span className="text-red-500">*</span>}
                              </label>
                              {renderCustomField(field)}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    
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
                    color: `black`
                  }}
                >
                  <p>Dengan mendaftar, Anda menyetujui syarat dan ketentuan yang berlaku</p>
                  <p>Butuh bantuan? Hubungi kami di <span className="font-semibold">help@eventorganizer.com</span></p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventRegistration;