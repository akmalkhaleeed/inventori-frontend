import React, { useState, useEffect } from 'react';
import MasterLayout from '../../layouts/MasterLayout';
import './Users.css';
import Swal from 'sweetalert2';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    
    // PERBAIKAN: Mengganti nama_lengkap menjadi name sesuai database
    const initialFormState = {
        name: '', email: '', username: '', role: 'petugas', password: ''
    };
    const [formData, setFormData] = useState(initialFormState);

    // ==========================================
    // 1. FUNGSI AMBIL DATA
    // ==========================================
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            console.log("Mencoba mengambil data dari API..."); // CEK 1
            
            const response = await fetch('http://127.0.0.1:8000/api/user', {
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });
            
            console.log("Response status:", response.status); // CEK 2
            
            const result = await response.json();
            console.log("Hasil JSON:", result); // CEK 3

            // Pengecekan data
            if (result && Array.isArray(result.data)) {
                setUsers(result.data);
            } else if (result && result.data && Array.isArray(result.data.data)) {
                setUsers(result.data.data);
            } else if (result && Array.isArray(result.users)) {
                setUsers(result.users);
            } else if (Array.isArray(result)) {
                setUsers(result);
            } else {
                console.log("Format data tidak dikenal:", result);
                setUsers([]);
            }

        } catch (error) {
            console.error("DETEKTIF ERROR:", error); // CEK 4
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // ==========================================
    // 2. FUNGSI HAPUS DATA
    // ==========================================
    const handleDelete = async (id, namaUser) => {
        if (!id) return;

        const result = await Swal.fire({
            title: 'Hapus Users?',
            text: `Anda yakin ingin menghapus akses untuk ${namaUser}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://127.0.0.1:8000/api/user/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
                });

                if (response.ok) {
                    Swal.fire('Terhapus!', 'Users berhasil dihapus.', 'success');
                    fetchData(); 
                } else {
                    const resJson = await response.json();
                    Swal.fire('Gagal!', resJson.message || 'Anda tidak bisa menghapus Users ini.', 'error');
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

    const openModalEdit = (user, idYangValid) => {
        setFormData({ 
            name: user.name || '', // Sesuaikan dengan DB Akmal
            email: user.email || '',
            username: user.username || '',
            role: user.role || 'petugas',
            password: '' // Kosongkan password saat edit
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
        const url = isEdit ? `http://127.0.0.1:8000/api/user/${editId}` : 'http://127.0.0.1:8000/api/user';
        const method = isEdit ? 'PUT' : 'POST';

        const payloadData = { ...formData };
        if (isEdit && !payloadData.password) {
            delete payloadData.password;
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payloadData)
            });

            const result = await response.json();

            if (response.ok) {
                Swal.fire('Berhasil!', isEdit ? 'Data Users diupdate.' : 'Users baru didaftarkan.', 'success');
                closeModal();
                fetchData();
            } else {
                Swal.fire('Gagal!', result.message || 'Periksa kembali data Anda.', 'error');
            }
        } catch (error) {
            Swal.fire('Error!', 'Tidak dapat terhubung ke server.', 'error');
        }
    };

    // ==========================================
    // RENDER UI & FILTER
    // ==========================================
    const getRoleBadge = (role) => {
        switch(role?.toLowerCase()) {
            case 'admin': return 'badge-admin';
            case 'petugas': return 'badge-petugas';
            case 'pimpinan': return 'badge-pimpinan';
            case 'kepala sekolah': return 'badge-pimpinan';
            default: return 'bg-secondary';
        }
    };

    const safeUsers = Array.isArray(users) ? users : [];

    const filteredData = safeUsers.filter(item => {
        // Pengecekan aman untuk kolom name dan username
        const namaUser = item.name || '';
        const uname = item.username || '';
        const cari = searchTerm || '';
        return namaUser.toLowerCase().includes(cari.toLowerCase()) || 
               uname.toLowerCase().includes(cari.toLowerCase());
    });

    return (
        <MasterLayout>
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                <div>
                    <h2 className="page-title mb-1">Manajemen Users</h2>
                    <small className="text-muted">Kelola hak akses Admin, Petugas, dan Pimpinan</small>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                    <input 
                        type="text" className="search-box" placeholder="Cari nama/username..."
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="btn-primary-custom" onClick={openModalTambah}>
                        <i className="fa fa-user-plus me-2"></i> Tambah User
                    </button>
                </div>
            </div>

            <div className="table-card">
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead>
                            <tr>
                                <th width="25%" className="ps-3">Nama Lengkap</th>
                                <th width="20%">Email</th>
                                <th width="20%">Username</th>
                                <th width="15%">Role</th>
                                <th width="15%" className="text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="5" className="text-center py-4">Memuat data...</td></tr>
                            ) : filteredData.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-4">Tidak ada data Users.</td></tr>
                            ) : (
                                filteredData.map((row) => {
                                    const validId = row.id || row.id_user;

                                    return (
                                        <tr key={validId}>
                                            <td className="ps-3">
                                                {/* Menggunakan row.name sesuai database Akmal */}
                                                <div className="fw-bold text-dark">{row.name}</div>
                                                <small className="text-muted">ID: #{validId}</small>
                                            </td>
                                            <td>{row.email}</td>
                                            <td>
                                                <span className="badge bg-light text-primary border">
                                                    @{row.username}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge rounded-pill px-3 ${getRoleBadge(row.role)}`}>
                                                    {row.role ? row.role.charAt(0).toUpperCase() + row.role.slice(1) : '-'}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <button className="btn-aksi btn-edit me-2" onClick={() => openModalEdit(row, validId)}>
                                                    <i className="fa fa-pen"></i>
                                                </button>
                                                <button className="btn-aksi btn-hapus" onClick={() => handleDelete(validId, row.name)}>
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

            {showModal && (
                <div className="custom-modal-overlay">
                    <div className="custom-modal" style={{ maxWidth: '600px' }}>
                        <div className="modal-header d-flex justify-content-between align-items-center">
                            <h5 className="fw-bold mb-0">
                                <i className={`fa ${isEdit ? 'fa-user-edit' : 'fa-user-plus'} me-2`}></i>
                                {isEdit ? 'Edit Users' : 'Tambah Users Baru'}
                            </h5>
                            <button type="button" className="btn-close" onClick={closeModal}></button>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3 mb-md-0">
                                        <label className="form-label fw-semibold small">Nama Lengkap</label>
                                        <input 
                                            type="text" name="name" className="form-control" 
                                            placeholder="Contoh: Budi Santoso" required
                                            value={formData.name} onChange={handleInputChange} 
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold small">Email</label>
                                        <input 
                                            type="email" name="email" className="form-control" 
                                            placeholder="budi@email.com" required
                                            value={formData.email} onChange={handleInputChange} 
                                        />
                                    </div>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3 mb-md-0">
                                        <label className="form-label fw-semibold small">Username</label>
                                        <input 
                                            type="text" name="username" className="form-control" 
                                            placeholder="budi123" required
                                            value={formData.username} onChange={handleInputChange} 
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold small">Role / Hak Akses</label>
                                        <select name="role" className="form-select" required
                                            value={formData.role} onChange={handleInputChange}>
                                            <option value="admin">Admin</option>
                                            <option value="petugas">Petugas</option>
                                            <option value="pimpinan">Pimpinan</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mb-2">
                                    <label className={`form-label fw-semibold small ${isEdit ? 'text-danger' : ''}`}>
                                        Password {isEdit && '(Kosongkan jika tidak diganti)'}
                                    </label>
                                    <input 
                                        type="password" name="password" className="form-control" 
                                        placeholder="••••••••" 
                                        required={!isEdit} 
                                        value={formData.password} onChange={handleInputChange} 
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-light px-4" onClick={closeModal}>Batal</button>
                                <button type="submit" className="btn btn-primary-custom px-4">
                                    {isEdit ? 'Simpan Perubahan' : 'Daftarkan User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MasterLayout>
    );
};

export default Users;