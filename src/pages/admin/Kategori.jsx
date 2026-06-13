import React, { useState, useEffect } from 'react';
import MasterLayout from '../../layouts/MasterLayout';
import './Kategori.css';
import Swal from 'sweetalert2';

const Kategori = () => {
    // State Utama
    const [kategoris, setKategoris] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // State Modal & Form
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({ nama_kategori: '' });

    // ==========================================
    // 1. FUNGSI AMBIL DATA KATEGORI
    // ==========================================
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://127.0.0.1:8000/api/kategori', {
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });
            const result = await response.json();
            setKategoris(result.data || []);
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
            title: 'Hapus Kategori?',
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
                const response = await fetch(`http://127.0.0.1:8000/api/kategori/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
                });

                if (response.ok) {
                    Swal.fire('Terhapus!', 'Kategori berhasil dihapus.', 'success');
                    fetchData(); 
                } else {
                    const resJson = await response.json();
                    // Pesan ini menyesuaikan jika kategori masih dipakai oleh tabel barang
                    Swal.fire('Gagal!', resJson.message || 'Kategori ini tidak bisa dihapus karena masih digunakan oleh data barang.', 'error');
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
        setFormData({ nama_kategori: e.target.value });
    };

    const openModalTambah = () => {
        setFormData({ nama_kategori: '' });
        setIsEdit(false);
        setShowModal(true);
    };

    const openModalEdit = (kategori, idYangValid) => {
        setFormData({ nama_kategori: kategori.nama_kategori });
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
        const url = isEdit ? `http://127.0.0.1:8000/api/kategori/${editId}` : 'http://127.0.0.1:8000/api/kategori';
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
                Swal.fire('Berhasil!', isEdit ? 'Kategori berhasil diupdate.' : 'Kategori baru ditambahkan.', 'success');
                closeModal();
                fetchData();
            } else {
                Swal.fire('Gagal!', result.message || 'Gagal menyimpan kategori.', 'error');
            }
        } catch (error) {
            Swal.fire('Error!', 'Tidak dapat terhubung ke server.', 'error');
        }
    };

    // Filter pencarian
    const filteredData = kategoris.filter(item => 
        item.nama_kategori.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <MasterLayout>
            {/* --- HEADER & PENCARIAN --- */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                <div>
                    <h2 className="page-title mb-1">Kategori Barang</h2>
                    <small className="text-muted">Kelola jenis dan pengelompokan barang</small>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                    <input 
                        type="text" className="search-box" placeholder="Cari kategori..."
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
                                <th width="10%">No</th>
                                <th>Nama Kategori</th>
                                <th width="15%" className="text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="3" className="text-center py-4">Memuat data...</td></tr>
                            ) : filteredData.length === 0 ? (
                                <tr><td colSpan="3" className="text-center py-4">Tidak ada data kategori.</td></tr>
                            ) : (
                                filteredData.map((row, i) => {
                                    // Mendapatkan ID yang benar (id atau id_kategori)
                                    const validId = row.id || row.id_kategori;

                                    return (
                                        <tr key={validId}>
                                            <td>{i + 1}</td>
                                            <td><strong className="text-dark">{row.nama_kategori}</strong></td>
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
                    <div className="custom-modal" style={{ maxWidth: '500px' }}>
                        <div className="modal-header d-flex justify-content-between align-items-center">
                            <h5 className="fw-bold mb-0">
                                {isEdit ? 'Edit Kategori' : 'Tambah Kategori'}
                            </h5>
                            <button type="button" className="btn-close" onClick={closeModal}></button>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="mb-2">
                                    <label className="form-label fw-semibold small">Nama Kategori</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="Contoh: Elektronik"
                                        required
                                        value={formData.nama_kategori} 
                                        onChange={handleInputChange} 
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-light px-4" onClick={closeModal}>Batal</button>
                                <button type="submit" className="btn btn-primary-custom px-4">
                                    {isEdit ? 'Simpan Perubahan' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MasterLayout>
    );
};

export default Kategori;