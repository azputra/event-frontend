// src/pages/Pesertas.js (Modal Fixed Version)
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Swal from 'sweetalert2';

// Completely redesigned modal component
const AddPesertaModal = ({ isOpen, onClose, onSubmit, formData, setFormData, events, submitting }) => {
  // If modal is not open, don't render anything
  if (!isOpen) return null;

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [customFields, setCustomFields] = useState([]);

  useEffect(() => {
    if (formData.event) {
      const event = events.find(e => e._id === formData.event);
      setSelectedEvent(event);
      setCustomFields(event?.customFields || []);
    } else {
      setSelectedEvent(null);
      setCustomFields([]);
    }
  }, [formData.event, events]);

  
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


  // Prevent clicks inside the modal from closing it
  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  return (
    // Fixed overlay that covers the entire screen
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto animate-fadeIn md:min-w-[600px] max-h-[90vh] overflow-y-auto"
        onClick={stopPropagation}
      >
        {/* Modal Header with gradient */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-lg sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-medium text-white">
              Tambah Peserta Baru
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-white rounded-md hover:text-gray-200 focus:outline-none"
            >
              <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Modal Body */}
        <div className="px-6 py-4">
          <form onSubmit={(e) => {
            e.preventDefault();
            onSubmit(e);
          }} className="space-y-4">
            {/* Fixed Fields */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700">
                  Nama
                </label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleInputChange}
                  required
                  className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700">
                  No HP
                </label>
                <input
                  type="text"
                  name="noHp"
                  value={formData.noHp}
                  onChange={handleInputChange}
                  required
                  className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700">
                  Event
                </label>
                <select
                  name="event"
                  value={formData.event}
                  onChange={handleInputChange}
                  required
                  className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Pilih Event</option>
                  {events.map((event) => (
                    <option key={event._id} value={event._id}>
                      {event.nama} - {new Date(event.tanggal).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Alamat
                </label>
                <textarea
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
            </div>
            
            {/* Custom Fields */}
            {customFields.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Informasi Tambahan</h3>
                
                <div className="space-y-4">
                  {customFields.map((field) => (
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
                          required={field.required}
                          placeholder={field.placeholder}
                          className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      )}
                      
                      {field.type === 'textarea' && (
                        <textarea
                          name={field.fieldId}
                          value={formData[field.fieldId] || ''}
                          onChange={handleInputChange}
                          required={field.required}
                          placeholder={field.placeholder}
                          rows="3"
                          className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        ></textarea>
                      )}
                      
                      {field.type === 'select' && (
                        <select
                          name={field.fieldId}
                          value={formData[field.fieldId] || ''}
                          onChange={handleInputChange}
                          required={field.required}
                          className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                                required={field.required && !formData[field.fieldId]}
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
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Modal Footer */}
            <div className="flex justify-end pt-4 mt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 mr-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 border border-transparent rounded-md shadow-sm hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menyimpan...
                  </>
                ) : (
                  'Simpan'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Pesertas = () => {
  const [customers, setPeserta] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    noHp: '',
    alamat: '',
    event: ''
  });
  
  // Filter state
  const [filterText, setFilterText] = useState('');
  const [filterEvent, setFilterEvent] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [customersRes, eventsRes] = await Promise.all([
          axios.get('https://event-backend-85661116f5a4.herokuapp.com/api/customers'),
          axios.get('https://event-backend-85661116f5a4.herokuapp.com/api/events')
        ]);
        
        setPeserta(customersRes.data);
        setEvents(eventsRes.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const resetForm = () => {
    setFormData({
      nama: '',
      email: '',
      noHp: '',
      alamat: '',
      event: ''
    });

    if (formData.event) {
      const event = events.find(e => e._id === formData.event);
      if (event && event.customFields) {
        event.customFields.forEach(field => {
          // Make sure to reset custom fields too
          emptyForm[field.fieldId] = field.type === 'checkbox' ? [] : '';
        });
      }
    }
    
    setFormData(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true); // Set loading state to true before submission
      
      const res = await axios.post('https://event-backend-85661116f5a4.herokuapp.com/api/customers', formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Peserta berhasil ditambahkan',
        timer: 1500,
        showConfirmButton: false
      });
      
      setPeserta([...customers, res.data]);
      resetForm();
      setShowModal(false);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: err.response?.data?.message || 'Error creating customer'
      });
      setError('Error creating customer');
    } finally {
      setSubmitting(false); // Reset loading state regardless of success/failure
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Peserta yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`https://event-backend-85661116f5a4.herokuapp.com/api/customers/${id}`);
          setPeserta(customers.filter(customer => customer._id !== id));
          
          Swal.fire({
            icon: 'success',
            title: 'Dihapus!',
            text: 'Peserta berhasil dihapus.',
            timer: 1500,
            showConfirmButton: false
          });
        } catch (err) {
          Swal.fire({
            icon: 'error',
            title: 'Gagal!',
            text: 'Terjadi kesalahan saat menghapus customer.'
          });
        }
      }
    });
  };

  const showCustomFieldDetails = (customer) => {
    if (!customer.registrationData || Object.keys(customer.registrationData).length === 0) {
      return;
    }
    
    // Find the event to get field labels
    const event = events.find(e => e._id === customer.event._id);
    const fieldLabels = {};
    
    if (event && event.customFields) {
      event.customFields.forEach(field => {
        fieldLabels[field.fieldId] = field.label;
      });
    }
    
    // Prepare custom field data
    const customFieldsHtml = Object.entries(customer.registrationData).map(([key, value]) => {
      const label = fieldLabels[key] || key;
      let displayValue = value;
      
      if (Array.isArray(value)) {
        displayValue = value.join(', ');
      }
      
      return `<div class="mb-2">
        <span class="font-medium">${label}:</span> 
        <span class="text-gray-800">${displayValue}</span>
      </div>`;
    }).join('');
    
    Swal.fire({
      title: `Info Tambahan: ${customer.nama}`,
      html: `<div class="text-left">${customFieldsHtml}</div>`,
      width: '32rem',
      showConfirmButton: true,
      confirmButtonText: 'Tutup',
      confirmButtonColor: '#3085d6'
    });
  };

  // Filter function
  const filteredPeserta = customers.filter(customer => {
    const textMatch = filterText === '' || 
                      customer.nama.toLowerCase().includes(filterText.toLowerCase()) ||
                      customer.email.toLowerCase().includes(filterText.toLowerCase()) ||
                      customer.noHp.toLowerCase().includes(filterText.toLowerCase()) ||
                      (customer.alamat && customer.alamat.toLowerCase().includes(filterText.toLowerCase()));
    
    const eventMatch = filterEvent === '' || customer.event?._id === filterEvent;
    
    const statusMatch = filterStatus === '' || 
                       (filterStatus === 'verified' && customer.isVerified) ||
                       (filterStatus === 'unverified' && !customer.isVerified);
    
    return textMatch && eventMatch && statusMatch;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPeserta.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPeserta.length / itemsPerPage);

  // Page change handler
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Daftar Peserta</h1>
        
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2 px-6 rounded-full shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Tambah Peserta
          </button>
        )}
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}
      
      {/* Add Peserta Modal */}
      <AddPesertaModal 
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        events={events}
        submitting={submitting} // Pass the submitting state
      />
      
      {/* Filter Section */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cari
            </label>
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Nama, Email, No HP, atau Alamat"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter Event
            </label>
            <select
              value={filterEvent}
              onChange={(e) => setFilterEvent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Event</option>
              {events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.nama}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Status</option>
              <option value="verified">Terverifikasi</option>
              <option value="unverified">Belum Verifikasi</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Table Section with Mobile Scroll */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No HP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alamat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Info Tambahan
                </th>
                {isAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="px-6 py-4 text-center text-gray-500">
                    Tidak ada data customer
                  </td>
                </tr>
              ) : (
                currentItems.map((customer) => (
                  <tr key={customer._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {customer.nama}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {customer.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {customer.noHp}
                    </td>
                    <td className="px-6 py-4 whitespace-normal max-w-xs truncate">
                      {customer.alamat || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {customer.event?.nama || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          customer.isVerified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {customer.isVerified ? 'Terverifikasi' : 'Belum Verifikasi'}
                      </span>
                    </td>
                    
                    {/* Custom Fields Info */}
                    <td className="px-6 py-4">
                      {customer.registrationData && Object.keys(customer.registrationData).length > 0 ? (
                        <button 
                          onClick={() => showCustomFieldDetails(customer)}
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Lihat Detail
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">Tidak ada</span>
                      )}
                    </td>
                    
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDelete(customer._id)}
                          className="text-red-600 hover:text-red-900 ml-4 transition duration-200"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination */}
      {filteredPeserta.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6">
          <div className="mb-4 sm:mb-0">
            <span className="text-sm text-gray-700">
              Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredPeserta.length)} dari {filteredPeserta.length} data
            </span>
          </div>
          
          <div className="flex">
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="mr-4 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={5}>5 / halaman</option>
              <option value={10}>10 / halaman</option>
              <option value={25}>25 / halaman</option>
            </select>
            
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                  currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                &laquo;
              </button>
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                  currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                &lsaquo;
              </button>
              
              {/* Page Numbers */}
              {[...Array(totalPages).keys()].map(number => {
                // Show only a few page buttons
                if (
                  number === 0 || 
                  number === totalPages - 1 || 
                  (number >= currentPage - 2 && number <= currentPage)
                ) {
                  return (
                    <button
                      key={number}
                      onClick={() => paginate(number + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === number + 1
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {number + 1}
                    </button>
                  );
                }
                return null;
              })}
              
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                  currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                &rsaquo;
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                  currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                &raquo;
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pesertas;