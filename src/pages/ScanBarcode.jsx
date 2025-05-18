// src/pages/ScanBarcode.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Html5Qrcode } from "html5-qrcode";
import Lottie from 'lottie-react';
import scanAnimation from '../assets/qr-scan.json';
import successAnimation from '../assets/success.json';
import errorAnimation from '../assets/error.json';
import waitingAnimation from '../assets/searching.json';

const ScanBarcode = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [qrScanner, setQrScanner] = useState(null);
  const [cameraId, setCameraId] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [scanStatus, setScanStatus] = useState('');
  const animationRef = useRef(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get('https://event-backend-ko3x.onrender.com/api/events');
        setEvents(res.data);
      } catch (err) {
        setError('Error fetching events: ' + (err.response?.data?.message || err.message));
        setScanStatus('error');
      }
    };
    
    fetchEvents();
    checkCameras();
  }, []);

  const checkCameras = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        setCameras(devices);
        setCameraId(devices[0].id);
      } else {
        setError('No cameras found on this device');
        setScanStatus('error');
      }
    } catch (err) {
      console.error('Error getting cameras:', err);
      setError('Unable to access camera: ' + (err.message || 'Please check camera permissions'));
      setScanStatus('error');
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const handleEventChange = (e) => {
    setSelectedEvent(e.target.value);
    setScanResult(null);
    setError('');
    setScanStatus('');
    if (scanning) {
      stopScanner();
    }
  };

  const handleCameraChange = (e) => {
    setCameraId(e.target.value);
    if (scanning) {
      stopScanner();
      setTimeout(() => startScanner(), 500);
    }
  };

  const startScanner = async () => {
    if (!cameraId || !selectedEvent) {
      setError('Silakan pilih event dan pastikan kamera tersedia');
      setScanStatus('error');
      return;
    }
    
    try {
      setError('');
      setScanResult(null);
      setScanStatus('scanning');
      
      // First, ensure any existing scanner is properly stopped
      if (qrScanner) {
        try {
          await qrScanner.stop();
        } catch (stopErr) {
          console.warn('Warning when stopping previous scanner:', stopErr);
        }
        setQrScanner(null);
      }
      
      const html5QrCode = new Html5Qrcode("reader");
      
      try {
        await html5QrCode.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          async (decodedText) => {
            setScanStatus('processing');
            
            let localScanner = html5QrCode; // Store reference in case state updates
            
            try {
              // Validate barcode format
              let barcodeData;
              try {
                barcodeData = JSON.parse(decodedText);
                if (!barcodeData.customerId) {
                  throw new Error('Invalid barcode format: missing customerId');
                }
              } catch (parseErr) {
                throw new Error('Format barcode tidak valid: ' + parseErr.message);
              }
              
              // Stop scanner safely
              try {
                await localScanner.stop();
              } catch (stopErr) {
                console.warn('Warning when stopping after scan:', stopErr);
              }
              
              // API check - validate server is available
              try {
                const res = await axios.post('https://event-backend-ko3x.onrender.com/api/customers/verify', {
                  customerId: barcodeData.customerId,
                  eventId: selectedEvent
                });
                
                console.log('API Response:', res.data);
                setScanResult(res.data);
                setScanStatus(res.data.success ? 'success' : 'failed');
              } catch (apiErr) {
                console.error('API error:', apiErr);
                
                let errorMessage = 'Verifikasi gagal';
                
                if (apiErr.response) {
                  errorMessage = apiErr.response.data.message || 'Server error: ' + apiErr.response.status;
                } else if (apiErr.request) {
                  errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi atau status server.';
                } else {
                  errorMessage = apiErr.message;
                }
                
                setError(errorMessage);
                setScanStatus('error');
              }
            } catch (err) {
              console.error('Processing error:', err);
              
              // Safe stop attempt 
              try {
                await localScanner.stop();
              } catch (stopErr) {
                console.warn('Warning stopping after error:', stopErr);
              }
              
              setError(err.message || 'Proses verifikasi gagal');
              setScanStatus('error');
            } finally {
              setScanning(false);
              setQrScanner(null);
            }
          },
          (errorMessage) => {
            // Only handle fatal scanner errors, not normal scan attempts
            if (errorMessage.includes('NotFoundError') || 
                errorMessage.includes('PermissionDenied') ||
                errorMessage.includes('NotAllowedError')) {
              console.error('Fatal scanner error:', errorMessage);
              setError(errorMessage);
              setScanStatus('error');
              setScanning(false);
              setQrScanner(null);
            }
          }
        );
        
        setQrScanner(html5QrCode);
        setScanning(true);
      } catch (startErr) {
        throw new Error('Gagal memulai scanner: ' + startErr.message);
      }
    } catch (err) {
      console.error('Scanner error:', err);
      setError('Error akses kamera: ' + (err.message || 'Periksa izin kamera dan coba lagi'));
      setScanStatus('error');
      setScanning(false);
    }
  };

  const stopScanner = () => {
    if (qrScanner) {
      qrScanner.stop().then(() => {
        console.log('Scanner stopped successfully');
      }).catch(error => {
        console.warn("Warning when stopping scanner:", error);
        // Still reset UI state even if there was an error
      }).finally(() => {
        setQrScanner(null);
        setScanning(false);
      });
    } else {
      setScanning(false);
    }
  };

  const resetScan = () => {
    setScanResult(null);
    setError('');
    setScanStatus('');
  };

  // Get the animation based on current status
  const getAnimationSource = () => {
    switch (scanStatus) {
      case 'scanning':
        return scanAnimation;
      case 'processing':
        return waitingAnimation;
      case 'success':
        return successAnimation;
      case 'error':
      case 'failed':
        return errorAnimation;
      default:
        return waitingAnimation;
    }
  };

  // Function to render status message with appropriate styling
  const renderStatusMessage = () => {
    if (!scanStatus) return null;
    
    let message = '';
    let className = '';
    let icon = '';
    
    switch (scanStatus) {
      case 'scanning':
        message = 'Memindai... Arahkan kamera ke barcode';
        className = 'bg-blue-50 border-l-4 border-blue-500 text-blue-700';
        icon = (
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
        );
        break;
      case 'processing':
        message = 'Memproses barcode... Harap tunggu';
        className = 'bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700';
        icon = (
          <svg className="w-6 h-6 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        );
        break;
      case 'success':
        message = scanResult?.message || 'Verifikasi berhasil!';
        className = 'bg-green-50 border-l-4 border-green-500 text-green-700';
        icon = (
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        );
        break;
      case 'failed':
        message = scanResult?.message || 'Verifikasi gagal!';
        className = 'bg-orange-50 border-l-4 border-orange-500 text-orange-700';
        icon = (
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        );
        break;
      case 'error':
        message = error || 'Terjadi kesalahan';
        className = 'bg-red-50 border-l-4 border-red-500 text-red-700';
        icon = (
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        );
        break;
      default:
        return null;
    }
    
    return (
      <div className={`${className} px-6 py-4 rounded-lg shadow-md mb-6 flex items-center`}>
        {icon}
        <p className="font-medium">{message}</p>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Scan Barcode</h1>
          <p className="text-gray-600">Verifikasi kehadiran peserta event dengan scan barcode</p>
        </div>
        
        <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-100">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Event
            </label>
            <div className="relative">
              <select
                value={selectedEvent}
                onChange={handleEventChange}
                className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-3 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Pilih Event</option>
                {events.map((event) => (
                  <option key={event._id} value={event._id}>
                    {event.nama} - {new Date(event.tanggal).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>
          
          {cameras.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Kamera
              </label>
              <div className="relative">
                <select
                  value={cameraId}
                  onChange={handleCameraChange}
                  className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-3 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  {cameras.map((camera) => (
                    <option key={camera.id} value={camera.id}>
                      {camera.label || `Camera ${camera.id}`}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            </div>
          )}
          
          {/* Show status message */}
          {renderStatusMessage()}
          
          {scanResult && scanResult.success && (
            <div className="mb-6 animate-fadeIn">
              <div className="bg-green-50 border border-green-100 rounded-xl overflow-hidden shadow-md">
                <div className="p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-24 h-24">
                      <Lottie animationData={successAnimation} loop={true} />
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-xl text-green-800 text-center mb-4">Verifikasi Berhasil!</h3>
                  <p className="text-center text-green-700 mb-6">{scanResult.message}</p>
                  
                  {scanResult.customer && (
                    <div className="bg-white rounded-lg p-6 shadow-inner border border-green-100 mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                          </svg>
                          <div>
                            <div className="text-xs text-gray-500">Nama</div>
                            <div className="font-medium">{scanResult.customer.nama}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                          </svg>
                          <div>
                            <div className="text-xs text-gray-500">Email</div>
                            <div className="font-medium">{scanResult.customer.email}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                          </svg>
                          <div>
                            <div className="text-xs text-gray-500">No HP</div>
                            <div className="font-medium">{scanResult.customer.noHp}</div>
                          </div>
                        </div>
                        
                        {scanResult.customer.verifiedAt && (
                          <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <div>
                              <div className="text-xs text-gray-500">Waktu Verifikasi</div>
                              <div className="font-medium">{new Date(scanResult.customer.verifiedAt).toLocaleString('id-ID')}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-center">
                    <button
                      onClick={resetScan}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all"
                    >
                      Scan Tiket Lainnya
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {scanResult && !scanResult.success && (
            <div className="mb-6 animate-fadeIn">
              <div className="bg-red-50 border border-red-100 rounded-xl overflow-hidden shadow-md">
                <div className="p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-24 h-24">
                      <Lottie animationData={errorAnimation} loop={true} />
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-xl text-red-800 text-center mb-4">Verifikasi Gagal!</h3>
                  <p className="text-center text-red-700 mb-6">{scanResult.message}</p>
                  
                  <div className="flex justify-center">
                    <button
                      onClick={resetScan}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all"
                    >
                      Scan Tiket Lainnya
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {selectedEvent && !scanResult && (
            <div className="animate-fadeIn">
              {!scanning ? (
                <div className="flex justify-center mb-6">
                  <button
                    onClick={startScanner}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    Buka Scanner
                  </button>
                </div>
              ) : (
                <div className="flex justify-center mb-6">
                  <button
                    onClick={stopScanner}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-medium rounded-lg shadow-md hover:from-red-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-all flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    Tutup Scanner
                  </button>
                </div>
              )}
              
              <div className="w-full mx-auto relative">
                <div 
                  id="reader" 
                  className="border border-gray-200 rounded-xl overflow-hidden shadow-md"
                  style={{ width: '100%' }}
                ></div>
                {scanning && scanStatus === 'scanning' && (
                  <div className="bg-blue-900 bg-opacity-80 text-white py-3 px-4 rounded-lg shadow-lg absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center">
                    <svg className="animate-pulse w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p className="text-xs">Arahkan kamera ke barcode</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {!selectedEvent && !error && (
            <div className="py-6 flex flex-col items-center justify-center">
              <div className="w-48 h-48 mb-4">
                <Lottie animationData={waitingAnimation} loop={true} />
              </div>
              <p className="text-gray-600 text-center">Silakan pilih event untuk mulai memindai</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScanBarcode;