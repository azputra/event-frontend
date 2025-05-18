// components/RegistrationLinkDisplay.js
import React from 'react';
import Swal from 'sweetalert2';
import { jsPDF } from 'jspdf';

const RegistrationLinkDisplay = ({ event }) => {
  const registrationUrl = `${window.location.origin}/register/${event.registrationSlug}`;
  
  const copyLink = () => {
    navigator.clipboard.writeText(registrationUrl);
    Swal.fire({
      icon: 'success',
      title: 'Link Disalin!',
      text: 'Link pendaftaran telah disalin ke clipboard',
      timer: 1500,
      showConfirmButton: false
    });
  };
  
  const viewQRCode = () => {
    // Generate QR Code for the registration link
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(registrationUrl)}`;
    
    Swal.fire({
      title: `QR Pendaftaran: ${event.nama}`,
      imageUrl: qrCodeUrl,
      imageWidth: 200,
      imageHeight: 200,
      html: `
        <div class="mt-4">
          <p class="text-sm text-gray-600">Scan untuk membuka link pendaftaran</p>
          <p class="text-xs text-gray-500 mt-2">${registrationUrl}</p>
        </div>
      `,
      confirmButtonText: 'Tutup',
      confirmButtonColor: '#3085d6'
    });
  };
  
  const downloadPDF = () => {
    // Generate QR Code for the registration link
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(registrationUrl)}`;
    
    // Create a temporary image element to load the QR code
    const img = new Image();
    img.crossOrigin = "Anonymous";  // This enables CORS
    
    img.onload = () => {
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add content to PDF
      pdf.setFontSize(16);
      pdf.text('Informasi Pendaftaran Event', 105, 20, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.text(`Nama Event: ${event.nama}`, 105, 35, { align: 'center' });
      
      // Add QR code
      pdf.addImage(img, 'PNG', 55, 45, 100, 100);
      
      pdf.setFontSize(12);
      pdf.text('Scan QR Code di atas atau kunjungi link berikut:', 105, 155, { align: 'center' });
      pdf.text(registrationUrl, 105, 165, { align: 'center' });
      
      // Save PDF
      pdf.save(`pendaftaran-${event.registrationSlug}.pdf`);
    };
    
    img.onerror = () => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal memuat QR Code. Silakan coba lagi.',
      });
    };
    
    // Start loading the image
    img.src = qrCodeUrl;
  };
  
  return (
    <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
      <h4 className="text-sm font-medium text-blue-800 mb-2">Link Pendaftaran</h4>
      <div className="flex items-center">
        <input
          type="text"
          value={registrationUrl}
          readOnly
          className="flex-1 p-2 text-sm border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={copyLink}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-r-md"
          title="Copy link"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
      <div className="mt-2 flex justify-between">
        <div className="flex space-x-3">
          <button
            onClick={viewQRCode}
            className="text-blue-600 text-sm hover:text-blue-800 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            Lihat QR Code
          </button>
          <button
            onClick={downloadPDF}
            className="text-blue-600 text-sm hover:text-blue-800 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </button>
        </div>
        <a 
          href={`/register/${event.registrationSlug}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 text-sm hover:text-blue-800 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Buka Link
        </a>
      </div>
    </div>
  );
};

export default RegistrationLinkDisplay;