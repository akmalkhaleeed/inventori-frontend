import React, { useState, useEffect } from 'react';
import MasterLayout from '../../layouts/MasterLayout';
import './DataBarang.css';
import Swal from 'sweetalert2';

const DataBarang = () => {
    // State Utama
    const [barangs, setBarangs] = useState([]);
    const [kategoris, setKategoris] = useState([]); 
    const [suppliers, setSuppliers] = useState([]); 
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // State Modal
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    
    const initialFormState = {
        nama_barang: '', id_kategori: '', id_supplier: '',
        stok: '', satuan: '', lokasi_rak: '', harga_beli: '', harga_jual: ''
    };
    const [formData, setFormData] = useState(initialFormState);

    // ==========================================
    // FUNGSI AMBIL DATA (API CALLS)
    // ==========================================
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };

            const resBarang = await fetch('http://127.0.0.1:8000/api/barang', { headers });
            const dataBarang = await resBarang.json();
            setBarangs(dataBarang.data || []);

            const resKategori = await fetch('http://127.0.0.1:8000/api/kategori', { headers });
            if (resKategori.ok) {
                const dataKategori = await resKategori.json();
                setKategoris(dataKategori.data || []);
            }

            const resSupplier = await fetch('http://127.0.0.1:8000/api/supplier', { headers });
            if (resSupplier.ok) {
                const dataSupplier = await resSupplier.json();
                setSuppliers(dataSupplier.data || []);
            }

        } catch (error) {
            console.error("Gagal ambil data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // ==========================================
    // FUNGSI HAPUS DATA (PERBAIKAN ID)
    // ==========================================
    const handleDelete = async (id) => {
        // Mencegah error jika ID ternyata kosong
        if (!id) {
            Swal.fire('Error!', 'ID Barang tidak terbaca oleh sistem.', 'error');
            return;
        }

        const result = await Swal.fire({
            title: 'Hapus Barang?',
            text: 'Tindakan ini tidak dapat dibatalkan.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://127.0.0.1:8000/api/barang/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
                });

                if (response.ok) {
                    Swal.fire('Berhasil!', 'Barang berhasil dihapus.', 'success');
                    fetchData(); 
                } else {
                    const resJson = await response.json();
                    Swal.fire('Gagal!', resJson.message || 'Data barang tidak ditemukan di server.', 'error');
                }
            } catch {
                Swal.fire('Error!', 'Terjadi kesalahan jaringan.', 'error');
            }
        }
    };

    // ==========================================
    // HANDLER MODAL & FORM
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

    // PERBAIKAN: Menerima ID yang pasti valid
    const openModalEdit = (barang, idYangValid) => {
        setFormData({
            nama_barang: barang.nama_barang,
            id_kategori: barang.id_kategori || '',
            id_supplier: barang.id_supplier || '',
            stok: barang.stok,
            satuan: barang.satuan,
            lokasi_rak: barang.lokasi_rak || '',
            harga_beli: barang.harga_beli,
            harga_jual: barang.harga_jual
        });
        setEditId(idYangValid); // Simpan ID yang benar
        setIsEdit(true);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    // ==========================================
    // FUNGSI SIMPAN DATA (PERBAIKAN TIPE DATA INTEGER)
    // ==========================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const url = isEdit ? `http://127.0.0.1:8000/api/barang/${editId}` : 'http://127.0.0.1:8000/api/barang';
        const method = isEdit ? 'PUT' : 'POST';

        // PERBAIKAN: Konversi string dari HTML menjadi Angka murni (Integer) agar backend Laravel tidak marah
        const payloadData = {
            ...formData,
            id_kategori: parseInt(formData.id_kategori) || null,
            id_supplier: parseInt(formData.id_supplier) || null,
            stok: parseInt(formData.stok) || 0,
            harga_beli: parseInt(formData.harga_beli) || 0,
            harga_jual: parseInt(formData.harga_jual) || 0
        };

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payloadData) // Kirim data yang sudah jadi Angka
            });

            const result = await response.json();

            if (response.ok) {
                Swal.fire('Berhasil!', isEdit ? 'Data barang diperbarui.' : 'Barang baru ditambahkan.', 'success');
                closeModal();
                fetchData();
            } else {
                Swal.fire('Gagal!', result.message || 'Periksa kembali input form Anda.', 'error');
            }
        } catch (error) {
            Swal.fire('Error!', 'Tidak dapat terhubung ke server.', 'error');
        }
    };

    // ==========================================
    // RENDER UI
    // ==========================================
    const getStokClass = (stok) => {
        if (stok <= 5) return 'stok-danger';
        if (stok <= 15) return 'stok-warning';
        return 'stok-aman';
    };

    const filteredData = barangs.filter(item => 
        item.nama_barang.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <MasterLayout>
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                <div>
                    <h2 className="page-title mb-1">Manajemen Barang</h2>
                    <small className="text-muted">Kelola data inventaris barang perusahaan</small>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                    <input 
                        type="text" className="search-box" placeholder="Cari barang..."
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="btn-primary-custom" onClick={openModalTambah}>
                        <i className="fa fa-plus me-2"></i> Tambah Barang
                    </button>
                </div>
            </div>

            <div className="table-card">
                <div className="table-responsive">
                    <table className="table align-middle" id="barangTable">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Nama Barang</th>
                                <th>Kategori</th>
                                <th>Rak</th>
                                <th>Stok</th>
                                <th>Harga Beli</th>
                                <th>Harga Jual</th>
                                <th className="text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="8" className="text-center py-5">Memuat data...</td></tr>
                            ) : filteredData.length === 0 ? (
                                <tr><td colSpan="8" className="text-center py-5">Tidak ada data barang.</td></tr>
                            ) : (
                                filteredData.map((row, i) => {
                                    // PERBAIKAN: Mencari tau nama Primary Key-nya apa (id atau id_barang)
                                    const validId = row.id || row.id_barang; 

                                    return (
                                        <tr key={validId}>
                                            <td>{i + 1}</td>
                                            <td className="fw-semibold">{row.nama_barang}</td>
                                            <td>{row.nama_kategori || '-'}</td>
                                            <td><span className="badge bg-light text-dark border">{row.lokasi_rak || '-'}</span></td>
                                            <td>
                                                <span className={`stok-badge ${getStokClass(row.stok)}`}>
                                                    {row.stok} {row.satuan}
                                                </span>
                                            </td>
                                            <td>Rp {Number(row.harga_beli).toLocaleString('id-ID')}</td>
                                            <td>Rp {Number(row.harga_jual).toLocaleString('id-ID')}</td>
                                            <td className="text-center">
                                                {/* Edit sekarang mengirim validId juga */}
                                                <button className="btn-aksi btn-edit me-2" onClick={() => openModalEdit(row, validId)}>
                                                    <i className="fa fa-pen"></i>
                                                </button>
                                                {/* Hapus menggunakan validId */}
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

            {/* --- MODAL PRO --- */}
            {showModal && (
                <div className="custom-modal-overlay">
                    <div className="custom-modal">
                        <div className="modal-header d-flex justify-content-between align-items-center">
                            <h5 className="fw-bold mb-0">
                                {isEdit ? 'Edit Data Barang' : 'Tambah Barang'}
                            </h5>
                            <button type="button" className="btn-close" onClick={closeModal}></button>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Nama Barang</label>
                                    <input type="text" name="nama_barang" className="form-control" required
                                        value={formData.nama_barang} onChange={handleInputChange} />
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3 mb-md-0">
                                        <label className="form-label fw-semibold">Kategori</label>
                                        <select name="id_kategori" className="form-select" required
                                            value={formData.id_kategori} onChange={handleInputChange}>
                                            <option value="">- Pilih Kategori -</option>
                                            {kategoris.map(kat => {
                                                // Sama halnya dengan ini, cari ID kategori yang benar
                                                const katId = kat.id || kat.id_kategori;
                                                return <option key={katId} value={katId}>{kat.nama_kategori}</option>
                                            })}
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Supplier</label>
                                        <select name="id_supplier" className="form-select" required
                                            value={formData.id_supplier} onChange={handleInputChange}>
                                            <option value="">- Pilih Supplier -</option>
                                            {suppliers.map(sup => {
                                                // Cari ID supplier yang benar
                                                const supId = sup.id || sup.id_supplier;
                                                return <option key={supId} value={supId}>{sup.nama_supplier}</option>
                                            })}
                                        </select>
                                    </div>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-4 mb-3 mb-md-0">
                                        <label className="form-label fw-semibold">Stok</label>
                                        <input type="number" name="stok" className="form-control" required
                                            value={formData.stok} onChange={handleInputChange} />
                                    </div>
                                    <div className="col-md-4 mb-3 mb-md-0">
                                        <label className="form-label fw-semibold">Satuan</label>
                                        <input type="text" name="satuan" className="form-control" placeholder="pcs/box" required
                                            value={formData.satuan} onChange={handleInputChange} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold">Lokasi Rak</label>
                                        <input type="text" name="lokasi_rak" className="form-control" placeholder="A-01"
                                            value={formData.lokasi_rak} onChange={handleInputChange} />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3 mb-md-0">
                                        <label className="form-label fw-semibold">Harga Beli</label>
                                        <input type="number" name="harga_beli" className="form-control" required
                                            value={formData.harga_beli} onChange={handleInputChange} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Harga Jual</label>
                                        <input type="number" name="harga_jual" className="form-control" required
                                            value={formData.harga_jual} onChange={handleInputChange} />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-light px-4" onClick={closeModal}>Batal</button>
                                <button type="submit" className="btn btn-primary-custom px-4">
                                    {isEdit ? 'Simpan' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MasterLayout>
    );
};

export default DataBarang;