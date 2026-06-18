import React, { useState, useEffect } from 'react';
import MasterLayout from '../../layouts/MasterLayout';
import Swal from 'sweetalert2';
import './SupplierPetugas.css';

const SupplierPetugas = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // State Modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);

    // State Form Tambah (Sudah diubah pakai no_telp)
    const [formData, setFormData] = useState({
        nama_supplier: '',
        no_telp: '',
        alamat: ''
    });

    const fetchData = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };

        try {
            const response = await fetch('http://127.0.0.1:8000/api/supplier', { headers });
            const result = await response.json();
            setSuppliers(result.data || result || []);
        } catch (error) {
            console.error("Gagal mengambil data supplier:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        try {
            const response = await fetch('http://127.0.0.1:8000/api/supplier', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                Swal.fire('Berhasil!', 'Supplier Berhasil Ditambahkan!', 'success');
                setShowAddModal(false);
                setFormData({ nama_supplier: '', no_telp: '', alamat: '' }); // Reset form
                fetchData(); // Refresh tabel
            } else {
                const res = await response.json();
                Swal.fire('Gagal', res.message || 'Terjadi kesalahan saat menyimpan', 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'Server tidak merespon.', 'error');
        }
    };

    const openDetail = (supplier) => {
        setSelectedSupplier(supplier);
        setShowDetailModal(true);
    };

    return (
        <MasterLayout>
            {/* Header & Button Tambah */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
                <div>
                    <h3 className="fw-bold mb-1">Data Supplier</h3>
                    <p className="text-muted small mb-0">Manajemen mitra penyedia barang inventaris.</p>
                </div>
                <button 
                    className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm"
                    onClick={() => setShowAddModal(true)}
                >
                    <i className="fas fa-plus me-2"></i> Tambah Supplier
                </button>
            </div>

            {/* Tabel Data Supplier */}
            <div className="card-supplier">
                <div className="table-responsive">
                    <table className="table align-middle mb-0">
                        <thead className="table-light">
                            <tr className="text-muted small text-uppercase" style={{ letterSpacing: '0.5px' }}>
                                <th className="ps-4 py-3">NAMA MITRA</th>
                                <th className="py-3">KONTAK</th>
                                <th className="d-none d-md-table-cell py-3">ALAMAT</th>
                                <th className="text-center py-3 pe-4">AKSI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-5 text-muted">
                                        <i className="fas fa-spinner fa-spin me-2"></i> Memuat data...
                                    </td>
                                </tr>
                            ) : suppliers.length > 0 ? (
                                suppliers.map((row) => (
                                    <tr key={row.id_supplier}>
                                        <td className="ps-4 py-3">
                                            <div className="fw-bold text-dark">{row.nama_supplier}</div>
                                            <small className="text-muted">#SUP-{row.id_supplier}</small>
                                        </td>
                                        {/* Menampilkan no_telp dari database */}
                                        <td className="py-3"><span className="badge-kontak">{row.no_telp}</span></td>
                                        <td className="small text-muted d-none d-md-table-cell text-truncate py-3" style={{ maxWidth: '200px' }}>
                                            {row.alamat}
                                        </td>
                                        <td className="text-center pe-4 py-3">
                                            <button 
                                                className="btn btn-light btn-sm rounded-pill px-3 fw-bold border shadow-sm btn-detail-hover"
                                                onClick={() => openDetail(row)}
                                            >
                                                Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-5 text-muted">
                                        Belum ada data supplier.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* =========================================
                MODAL TAMBAH SUPPLIER 
            ========================================== */}
            {showAddModal && (
                <div className="sup-modal-overlay">
                    <div className="sup-modal-box">
                        <div className="sup-modal-header">
                            <h5 className="fw-bold mb-0 text-dark">Tambah Mitra Baru</h5>
                            <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                        </div>
                        <form onSubmit={handleAddSubmit}>
                            <div className="sup-modal-body">
                                <div className="mb-3">
                                    <label className="sup-form-label">Nama Perusahaan</label>
                                    <input 
                                        type="text" 
                                        name="nama_supplier" 
                                        className="form-control sup-input" 
                                        placeholder="Masukkan nama PT/CV" 
                                        value={formData.nama_supplier}
                                        onChange={handleInputChange}
                                        required 
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="sup-form-label">Nomor Telepon / WA</label>
                                    <input 
                                        type="text" 
                                        name="no_telp" 
                                        className="form-control sup-input" 
                                        placeholder="Contoh: 08123456789" 
                                        value={formData.no_telp}
                                        onChange={handleInputChange}
                                        required 
                                    />
                                </div>
                                <div className="mb-0">
                                    <label className="sup-form-label">Alamat Lengkap</label>
                                    <textarea 
                                        name="alamat" 
                                        className="form-control sup-input" 
                                        rows="3" 
                                        placeholder="Alamat kantor supplier..." 
                                        value={formData.alamat}
                                        onChange={handleInputChange}
                                        required
                                    ></textarea>
                                </div>
                            </div>
                            <div className="sup-modal-footer">
                                <button type="submit" className="btn btn-primary w-100 rounded-pill fw-bold py-2 shadow-sm">
                                    Simpan Mitra
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =========================================
                MODAL DETAIL SUPPLIER 
            ========================================== */}
            {showDetailModal && selectedSupplier && (
                <div className="sup-modal-overlay">
                    <div className="sup-modal-box">
                        <div className="sup-modal-header">
                            <h5 className="fw-bold mb-0 text-primary">Informasi Supplier</h5>
                            <button type="button" className="btn-close" onClick={() => setShowDetailModal(false)}></button>
                        </div>
                        <div className="sup-modal-body">
                            <div className="bg-light p-4 rounded-4 mb-4 text-center border">
                                <small className="text-muted fw-bold d-block mb-1">
                                    #SUP-{selectedSupplier.id_supplier}
                                </small>
                                <h4 className="fw-bold text-dark mb-0">{selectedSupplier.nama_supplier}</h4>
                            </div>
                            <div className="row g-3">
                                <div className="col-12">
                                    <label className="sup-form-label mb-1">Kontak Person</label>
                                    <p className="fw-bold text-dark mb-0 fs-5">{selectedSupplier.no_telp}</p>
                                </div>
                                <div className="col-12">
                                    <label className="sup-form-label mb-1">Alamat Kantor</label>
                                    <p className="text-muted mb-0">{selectedSupplier.alamat}</p>
                                </div>
                            </div>
                        </div>
                        <div className="sup-modal-footer">
                            <button 
                                type="button" 
                                className="btn btn-light w-100 rounded-pill border fw-bold py-2 shadow-sm" 
                                onClick={() => setShowDetailModal(false)}
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MasterLayout>
    );
};

export default SupplierPetugas;