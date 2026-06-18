import React, { useState, useEffect } from 'react';
import MasterLayout from '../../layouts/MasterLayout';
import './KategoriPetugas.css';

const KategoriPetugas = () => {
    const [kategoris, setKategoris] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };

        try {
            const response = await fetch('http://127.0.0.1:8000/api/kategori', { headers });
            const result = await response.json();
            
            // Simpan data dari API
            setKategoris(result.data || result || []);
        } catch (error) {
            console.error("Gagal mengambil data kategori:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const totalKategori = kategoris.length;

    return (
        <MasterLayout>
            {/* Page Title & Stats */}
            <div className="page-title-box mb-4">
                <div className="row align-items-center">
                    <div className="col-md-8">
                        <h3 className="fw-bold mb-1">Daftar Kategori</h3>
                        <p className="text-muted mb-0">Manajemen pengelompokan barang inventaris.</p>
                    </div>
                    <div className="col-md-4 mt-3 mt-md-0">
                        <div className="stat-card-mini shadow-sm">
                            <div className="icon-box-mini bg-soft-primary">
                                <i className="fa fa-tag"></i>
                            </div>
                            <div>
                                <small className="text-muted d-block small fw-bold">TOTAL KATEGORI</small>
                                <h4 className="fw-bold mb-0">{isLoading ? '...' : totalKategori.toLocaleString('id-ID')}</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Table Container */}
            <div className="table-container">
                <div className="table-responsive">
                    <table className="table align-middle mb-0">
                        <thead>
                            <tr>
                                <th width="80">No</th>
                                <th>Nama Kategori</th>
                                <th className="text-center">Aksi Petugas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="3" className="text-center py-5 text-muted">
                                        <i className="fas fa-spinner fa-spin fa-2x mb-2"></i>
                                        <p className="mb-0">Memuat data kategori...</p>
                                    </td>
                                </tr>
                            ) : kategoris.length > 0 ? (
                                kategoris.map((row, index) => (
                                    <tr key={row.id_kategori}>
                                        <td className="fw-bold text-muted">{index + 1}</td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <div className="bg-light p-2 rounded-3 me-3">
                                                    <i className="fa fa-folder-open text-primary"></i>
                                                </div>
                                                <span className="fw-bold text-dark">{row.nama_kategori}</span>
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            {/* Badge informasi view-only */}
                                            <span className="badge bg-light text-muted fw-normal border px-3 py-2 rounded-pill">
                                                Hanya Admin
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="text-center py-5">
                                        <img 
                                            src="https://illustrations.popsy.co/slate/empty-folder.svg" 
                                            alt="Empty" 
                                            style={{ width: '150px', opacity: 0.5 }} 
                                        />
                                        <p className="text-muted mt-3 small">Belum ada data kategori barang.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </MasterLayout>
    );
};

export default KategoriPetugas;