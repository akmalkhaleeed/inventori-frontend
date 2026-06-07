import React from 'react';
import Sidebar from '../components/Sidebar';

const MasterLayout = ({ children }) => {
    return (
        <div className="d-flex" style={{ minHeight: '100vh', background: '#f1f5f9' }}>
            {/* 1. Memanggil komponen Sidebar di sebelah kiri */}
            <Sidebar />

            {/* 2. Area kanan untuk isi halaman */}
            {/* marginLeft diset 280px agar konten tidak tertutup oleh Sidebar yang posisinya fixed */}
            <div className="flex-grow-1" style={{ marginLeft: '280px', transition: 'all 0.3s' }}>
                <div className="p-4">
                    {/* {children} adalah variabel spesial React untuk menampilkan konten dari halaman lain */}
                    {children} 
                </div>
            </div>
        </div>
    );
};

export default MasterLayout;