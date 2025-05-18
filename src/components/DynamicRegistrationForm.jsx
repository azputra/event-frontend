// src/components/DynamicRegistrationForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const DynamicRegistrationForm = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/events/by-slug/${slug}`);
        setEvent(res.data);
        
        // Initialize form data with empty values
        const initialData = {
          event: res.data._id,
          nama: '',
          email: '',
          noHp: '',
          alamat: ''
        };
        
        // Add custom fields
        if (res.data.customFields && res.data.customFields.length > 0) {
          res.data.customFields.forEach(field => {
            initialData[field.fieldId] = field.type === 'checkbox' ? [] : '';
          });
        }
        
        setFormData(initialData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching event', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Event tidak ditemukan'
        });
        navigate('/');
      }
    };
    
    fetchEvent();
  }, [slug, navigate]);
  
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
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Validate required fixed fields
    if (!formData.nama) newErrors.nama = 'Nama wajib diisi';
    if (!formData.email) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    if (!formData.noHp) newErrors.noHp = 'No. HP wajib diisi';
    if (!formData.alamat) newErrors.alamat = 'Alamat wajib diisi';
    
    // Validate required custom fields
    if (event.customFields && event.customFields.length > 0) {
      event.customFields.forEach(field => {
        if (field.required) {
          const value = formData[field.fieldId];
          if (!value || (Array.isArray(value) && value.length === 0)) {
            newErrors[field.fieldId] = `${field.label} wajib diisi`;
          }
        }
      });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      window.scrollTo(0, 0);
      return;
    }
    
    try {
      setSubmitting(true);
      
      const res = await axios.post('/api/customers', formData);
      
      Swal.fire({
        icon: 'success',
        title: 'Pendaftaran Berhasil!',
        text: 'Kami telah mengirimkan tiket ke email Anda.',
        confirmButtonColor: '#3085d6'
      }).then(() => {
        navigate('/registration-success', { state: { email: formData.email } });
      });
    } catch (err) {
      console.error('Error submitting form', err);
      
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Event tidak ditemukan</h1>
        <p>Link pendaftaran tidak valid atau event telah berakhir.</p>
      </div>
    );
  }
  
  // Create style based on event settings
  const bgStyle = event.backgroundImage
    ? { backgroundImage: `url(/api/events/image/${event._id})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundColor: event.backgroundColor || '#ffffff' };
  
  return (
    <div style={bgStyle} className="min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 py-6 px-6 md:px-10">
            <h1 className="text-2xl md:text-3xl font-bold text-white">{event.nama}</h1>
            <p className="text-blue-100 mt-2">
              {new Date(event.tanggal).toLocaleDateString('id-ID', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
              {event.lokasi && ` • ${event.lokasi}`}
            </p>
          </div>
          
          {/* Body */}
          <div className="p-6 md:p-10">
            {/* Description */}
            {event.deskripsi && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-3">Tentang Event</h2>
                <p className="text-gray-700">{event.deskripsi}</p>
              </div>
            )}
            
            {/* Form */}
            <div>
              <h2 className="text-xl font-semibold mb-6">Form Pendaftaran</h2>
              
              {/* Error Alert */}
              {Object.keys(errors).length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Mohon perbaiki kesalahan berikut:
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <ul className="list-disc pl-5 space-y-1">
                          {Object.values(errors).map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Fixed Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nama"
                      value={formData.nama || ''}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-md ${
                        errors.nama ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Masukkan nama lengkap"
                    />
                    {errors.nama && (
                      <p className="mt-1 text-sm text-red-600">{errors.nama}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-md ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="nama@contoh.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      No. HP <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="noHp"
                      value={formData.noHp || ''}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-md ${
                        errors.noHp ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="08xxxxxxxxxx"
                    />
                    {errors.noHp && (
                      <p className="mt-1 text-sm text-red-600">{errors.noHp}</p>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alamat <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="alamat"
                      value={formData.alamat || ''}
                      onChange={handleInputChange}
                      rows="3"
                      className={`w-full px-4 py-2 border rounded-md ${
                        errors.alamat ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Masukkan alamat lengkap"
                    ></textarea>
                    {errors.alamat && (
                      <p className="mt-1 text-sm text-red-600">{errors.alamat}</p>
                    )}
                  </div>
                </div>
                
                {/* Custom Fields */}
                {event.customFields && event.customFields.length > 0 && (
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-medium mb-4">Informasi Tambahan</h3>
                    
                    <div className="space-y-6">
                      {event.customFields.map((field) => (
                        <div key={field.fieldId}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {field.label}
                            {field.required && <span className="text-red-500"> *</span>}
                          </label>
                          
                          {field.type === 'text' && (
                            <input
                              type="text"
                              name={field.fieldId}
                              value={formData[field.fieldId] || ''}
                              onChange={handleInputChange}
                              placeholder={field.placeholder}
                              className={`w-full px-4 py-2 border rounded-md ${
                                errors[field.fieldId] ? 'border-red-500' : 'border-gray-300'
                              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                          )}
                          
                          {field.type === 'textarea' && (
                            <textarea
                              name={field.fieldId}
                              value={formData[field.fieldId] || ''}
                              onChange={handleInputChange}
                              placeholder={field.placeholder}
                              rows="3"
                              className={`w-full px-4 py-2 border rounded-md ${
                                errors[field.fieldId] ? 'border-red-500' : 'border-gray-300'
                              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            ></textarea>
                          )}
                          
                          {field.type === 'select' && (
                            <select
                              name={field.fieldId}
                              value={formData[field.fieldId] || ''}
                              onChange={handleInputChange}
                              className={`w-full px-4 py-2 border rounded-md ${
                                errors[field.fieldId] ? 'border-red-500' : 'border-gray-300'
                              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            >
                              <option value="">{field.placeholder || 'Pilih...'}</option>
                              {field.options.map((option, index) => (
                                <option key={index} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          )}
                          
                          {field.type === 'radio' && (
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
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                  />
                                  <label htmlFor={`${field.fieldId}-${index}`} className="ml-3 text-sm text-gray-700">
                                    {option}
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {field.type === 'checkbox' && (
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
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <label htmlFor={`${field.fieldId}-${index}`} className="ml-3 text-sm text-gray-700">
                                    {option}
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {errors[field.fieldId] && (
                            <p className="mt-1 text-sm text-red-600">{errors[field.fieldId]}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex justify-center items-center"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Mendaftar...
                      </>
                    ) : (
                      'Daftar Sekarang'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicRegistrationForm;