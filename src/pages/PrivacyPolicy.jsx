// src/pages/PrivacyPolicy.js
import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-100">
        <h1 className="text-3xl font-bold text-blue-800 mb-6">Kebijakan Privasi - Aplikasi Scan Barcode</h1>
        
        <div className="prose prose-blue max-w-none">
          <p className="text-gray-600 mb-6">
            Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          
          <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">Pendahuluan</h2>
          <p>
            Kami menghargai privasi Anda dan berkomitmen untuk melindungi data pribadi Anda. Kebijakan privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi saat Anda menggunakan aplikasi Scan Barcode kami untuk memverifikasi kehadiran pada event.
          </p>
          
          <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">Penggunaan Kamera</h2>
          <p>
            Aplikasi ini menggunakan kamera perangkat Anda untuk tujuan tunggal: memindai barcode tiket event. Berikut adalah informasi penting tentang penggunaan kamera:
          </p>
          <ul className="list-disc pl-6 space-y-2 my-4">
            <li>Kami HANYA menggunakan kamera untuk memindai dan membaca barcode</li>
            <li>Kami TIDAK menyimpan gambar atau video apa pun</li>
            <li>Kami TIDAK mengirim data kamera ke server</li>
            <li>Akses kamera HANYA aktif saat Anda memberikan izin secara eksplisit dan saat scanner aktif</li>
            <li>Anda dapat mencabut izin kamera kapan saja melalui pengaturan browser Anda</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">Data yang Kami Kumpulkan</h2>
          <p>
            Saat Anda memindai barcode, kami hanya memproses informasi berikut:
          </p>
          <ul className="list-disc pl-6 space-y-2 my-4">
            <li>ID peserta yang terkandung dalam barcode</li>
            <li>ID event yang Anda pilih</li>
            <li>Waktu pemindaian untuk pencatatan kehadiran</li>
          </ul>
          <p>
            Informasi ini diperlukan untuk memverifikasi kehadiran peserta pada event yang dipilih.
          </p>
          
          <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">Keamanan Data</h2>
          <p>
            Kami mengambil langkah-langkah untuk memastikan keamanan data Anda:
          </p>
          <ul className="list-disc pl-6 space-y-2 my-4">
            <li>Semua transmisi data menggunakan protokol HTTPS yang aman</li>
            <li>Akses ke data dibatasi hanya untuk personel yang berwenang</li>
            <li>Kami tidak berbagi data dengan pihak ketiga yang tidak terkait dengan event</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">Hak Anda</h2>
          <p>
            Anda memiliki hak untuk:
          </p>
          <ul className="list-disc pl-6 space-y-2 my-4">
            <li>Menolak memberikan izin kamera</li>
            <li>Menggunakan opsi verifikasi manual sebagai alternatif</li>
            <li>Meminta informasi tentang data yang kami simpan tentang Anda</li>
            <li>Meminta penghapusan data Anda (sesuai dengan kebijakan penyimpanan data event)</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">Perubahan pada Kebijakan Privasi</h2>
          <p>
            Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu. Perubahan signifikan akan kami beritahukan melalui aplikasi atau melalui email.
          </p>
          
          <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">Hubungi Kami</h2>
          <p>
            Jika Anda memiliki pertanyaan tentang kebijakan privasi ini atau penggunaan data Anda, silakan hubungi kami di:
          </p>
          <p className="my-4">
            <strong>Email:</strong> privacy@example.com<br />
            <strong>Telepon:</strong> +62 123 4567 890
          </p>
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-200">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Kembali ke Halaman Scan Barcode
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;