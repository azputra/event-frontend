// src/components/AddEventModal.js (komponen baru)
import React, { useState, useRef } from 'react';
import ColorPicker from './ColorPicker'; // Asumsikan Anda memisahkan ColorPicker menjadi komponen terpisah
import EventCustomFieldsEditor from './EventCustomFieldsEditor'; 

const AddEventModal = ({ isOpen, onClose, onSubmit, initialData = {}, submitting }) => {
  // If modal is not open, don't render anything
  if (!isOpen) return null;
  
  const [formData, setFormData] = useState({
    nama: initialData.nama || '',
    tanggal: initialData.tanggal ? new Date(initialData.tanggal).toISOString().split('T')[0] : '',
    lokasi: initialData.lokasi || '',
    deskripsi: initialData.deskripsi || '',
    backgroundColor: initialData.backgroundColor || '#ffffff'
  });
  
  const [customFields, setCustomFields] = useState(initialData.customFields || []);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData.hasBackgroundImage ? `/api/events/image/${initialData._id}` : null);
  const [imageType, setImageType] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  
  const fileInputRef = useRef(null);
  
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  // Fungsi untuk membaca file sebagai base64
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Simpan tipe MIME
      setImageType(file.type);
      setRemoveImage(false);
      
      // Baca file sebagai base64
      const reader = new FileReader();
      reader.onloadend = () => {
        // Format hasil: data:image/jpeg;base64,/9j/4AAQSkZ...
        const base64String = reader.result;
        
        setSelectedFile(base64String);
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Fungsi untuk menghapus gambar
  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setImageType(null);
    setRemoveImage(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Prevent clicks inside the modal from closing it
  const stopPropagation = (e) => {
    e.stopPropagation();
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Buat objek data untuk dikirim
    const eventData = {
      ...formData,
      customFields,
      backgroundImage: selectedFile,
      backgroundImageType: imageType,
      removeBackgroundImage: removeImage
    };
    
    onSubmit(eventData);
  };

  return (
    // Fixed overlay that covers the entire screen
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      {/* Modal container - stop propagation to prevent closing when clicking inside */}
      <div 
        className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-4 md:mx-auto animate-fadeIn flex flex-col max-h-[90vh] overflow-auto relative"
        onClick={stopPropagation}
      >
        {/* Modal Header with gradient */}
        <div className="sticky top-0 z-10 px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-medium text-white">
              {initialData._id ? 'Edit Event' : 'Tambah Event Baru'}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-white rounded-md hover:text-gray-200 focus:outline-none"
              disabled={submitting}
            >
              <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Modal Body */}
        <div className="px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Existing form fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Event
                </label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Masukkan nama event"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal
                </label>
                <input
                  type="date"
                  name="tanggal"
                  value={formData.tanggal}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lokasi
                </label>
                <input
                  type="text"
                  name="lokasi"
                  value={formData.lokasi}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Masukkan lokasi event"
                />
              </div>
              
              {/* Add the ColorPicker component */}
              <ColorPicker formData={formData} setFormData={setFormData} />
              
              {/* Background Image Upload */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Image
                </label>
                <div className="mt-1 flex items-center">
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="h-32 w-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
                      >
                        <svg className="h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="h-32 w-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors cursor-pointer bg-gray-50"
                      onClick={() => fileInputRef.current.click()}
                    >
                      <div className="text-center p-4">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="mt-1 text-sm text-gray-500">
                          Klik untuk upload gambar
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          PNG, JPG, JPEG max 1MB
                        </p>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png,image/jpg"
                    className="hidden"
                  />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Deskripsi event (opsional)"
                ></textarea>
              </div>
            </div>

            <EventCustomFieldsEditor
              customFields={customFields}
              setCustomFields={setCustomFields}
            />
            
            {/* Modal Footer */}
            <div className="flex justify-end pt-4 mt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 mr-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={submitting}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 border border-transparent rounded-md shadow-sm hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center"
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
                  initialData._id ? 'Update Event' : 'Simpan Event'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEventModal;