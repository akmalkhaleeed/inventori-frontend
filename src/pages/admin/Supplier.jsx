import React, { useState, useEffect } from 'react';
import MasterLayout from '../../layouts/MasterLayout';
import './Supplier.css';
import Swal from 'sweetalert2';

const Supplier = () => {
    // State Utama
    const [suppliers, setSuppliers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // State Modal & Form
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    
    // Sesuaikan dengan kolom database terbaru (no_telp)
    const initialFormState = { nama_supplier: '', no_telp: '', alamat: '' };
    const [formData, setFormData] = useState(initialFormState);

    // ==========================================
    // 1. FUNGSI AMBIL DATA SUPPLIER
    // ==========================================
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://127.0.0.1:8000/api/supplier', {
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });
            const result = await response.json();
            setSuppliers(result.data || []);
        } catch (error) {
            console.error("Gagal ambil data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // ==========================================
    // 2. FUNGSI HAPUS DATA
    // ==========================================
    const handleDelete = async (id) => {
        if (!id) return;

        const result = await Swal.fire({
            title: 'Hapus Supplier?',
            text: 'Data yang sudah dihapus tidak dapat dikembalikan!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://127.0.0.1:8000/api/supplier/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
                });

                if (response.ok) {
                    Swal.fire('Terhapus!', 'Supplier berhasil dihapus.', 'success');
                    fetchData(); 
                } else {
                    const resJson = await response.json();
                    Swal.fire('Gagal!', resJson.message || 'Supplier tidak bisa dihapus karena masih digunakan.', 'error');
                }
            } catch {
                Swal.fire('Error!', 'Terjadi kesalahan saat terhubung ke server.', 'error');
            }
        }
    };

    // ==========================================
    // 3. HANDLER MODAL & FORM
    // ==========================================
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openModalTambah = () => {
        setFormData(initialFormState);
        setIsEdit(false);
        setShowModal(true);
    };

    const openModalEdit = (supplier, idYangValid) => {
        setFormData({ 
            nama_supplier: supplier.nama_supplier, 
            no_telp: supplier.no_telp || supplier.kontak || '', // Antisipasi jika API masih return 'kontak'
            alamat: supplier.alamat || '' 
        });
        setEditId(idYangValid);
        setIsEdit(true);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const url = isEdit ? `http://127.0.0.1:8000/api/supplier/${editId}` : 'http://127.0.0.1:8000/api/supplier';
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                Swal.fire('Berhasil!', isEdit ? 'Data supplier diupdate.' : 'Supplier baru ditambahkan.', 'success');
                closeModal();
                fetchData();
            } else {
                Swal.fire('Gagal!', result.message || 'Gagal menyimpan data.', 'error');
            }
        } catch (error) {
            Swal.fire('Error!', 'Tidak dapat terhubung ke server.', 'error');
        }
    };

    // Filter pencarian
    const filteredData = suppliers.filter(item => 
        item.nama_supplier.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <MasterLayout>
            {/* --- HEADER & PENCARIAN --- */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                <div>
                    <h2 className="page-title mb-1">Data Supplier</h2>
                    <small className="text-muted">Kelola daftar pemasok barang</small>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                    <input 
                        type="text" className="search-box" placeholder="Cari supplier..."
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="btn-primary-custom" onClick={openModalTambah}>
                        <i className="fa fa-plus me-2"></i> Tambah
                    </button>
                </div>
            </div>

            {/* --- TABEL DATA --- */}
            <div className="table-card">
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead>
                            <tr>
                                <th width="5%">No</th>
                                <th width="25%">Nama Supplier</th>
                                <th width="20%">No. Telepon</th>
                                <th width="35%">Alamat</th>
                                <th width="15%" className="text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="5" className="text-center py-4">Memuat data...</td></tr>
                            ) : filteredData.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-4">Tidak ada data supplier.</td></tr>
                            ) : (
                                filteredData.map((row, i) => {
                                    const validId = row.id || row.id_supplier;

                                    return (
                                        <tr key={validId}>
                                            <td>{i + 1}</td>
                                            <td><strong className="text-dark">{row.nama_supplier}</strong></td>
                                            <td>{row.no_telp || row.kontak || '-'}</td>
                                            <td><small className="text-muted">{row.alamat || '-'}</small></td>
                                            <td className="text-center">
                                                <button className="btn-aksi btn-edit me-2" onClick={() => openModalEdit(row, validId)}>
                                                    <i className="fa fa-pen"></i>
                                                </button>
                                                <button className="btn-aksi btn-hapus" onClick={() => handleDelete(validId)}>
                                                    <i className="fa fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODAL TAMBAH & EDIT --- */}
            {showModal && (
                <div className="custom-modal-overlay">
                    <div className="custom-modal" style={{ maxWidth: '550px' }}>
                        <div className="modal-header d-flex justify-content-between align-items-center">
                            <h5 className="fw-bold mb-0">
                                {isEdit ? 'Edit Supplier' : 'Tambah Supplier'}
                            </h5>
                            <button type="button" className="btn-close" onClick={closeModal}></button>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label fw-semibold small">Nama Perusahaan / Supplier</label>
                                    <input 
                                        type="text" name="nama_supplier" className="form-control" 
                                        placeholder="Contoh: PT. Sumber Makmur" required
                                        value={formData.nama_supplier} onChange={handleInputChange} 
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold small">No. Telepon / Kontak</label>
                                    <input 
                                        type="text" name="no_telp" className="form-control" 
                                        placeholder="Contoh: 08123456789" required
                                        value={formData.no_telp} onChange={handleInputChange} 
                                    />
                                </div>
                                <div className="mb-2">
                                    <label className="form-label fw-semibold small">Alamat Lengkap</label>
                                    <textarea 
                                        name="alamat" className="form-control" rows="3" 
                                        placeholder="Masukkan alamat lengkap..."
                                        value={formData.alamat} onChange={handleInputChange} 
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-light px-4" onClick={closeModal}>Batal</button>
                                <button type="submit" className="btn btn-primary-custom px-4">
                                    {isEdit ? 'Simpan Perubahan' : 'Simpan Data'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MasterLayout>
    );
};

export default Supplier;