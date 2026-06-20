import React, { useState, useEffect } from 'react';
import MasterLayout from '../../layouts/MasterLayout';
import './DaftarSupplier.css';

const DaftarSupplier = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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

    return (
        <MasterLayout>
            <div className="page-header-supplier d-flex justify-content-between align-items-center flex-wrap shadow-sm">
                <div className="position-relative z-1">
                    <h3 className="text-white fw-bold mb-1">Daftar Rekanan Supplier</h3>
                    <p className="text-white opacity-75 mb-0">Informasi supplier dan kontak rekanan</p>
                </div>
            </div>

            <div className="card-table-supplier">
                <div className="table-responsive">
                    <table className="table align-middle mb-0">
                        <thead className="table-light">
                            <tr className="small text-muted font-uppercase">
                                <th width="5%" className="text-center">No</th>
                                <th width="30%">Nama Supplier</th>
                                <th width="25%">Kontak</th>
                                <th width="40%">Alamat</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-5 text-muted">
                                        <i className="fas fa-spinner fa-spin fa-2x mb-2"></i>
                                        <p className="mb-0">Memuat data supplier...</p>
                                    </td>
                                </tr>
                            ) : suppliers.length > 0 ? (
                                suppliers.map((row, idx) => (
                                    <tr key={row.id_supplier || idx}>
                                        <td className="text-center text-muted fw-bold">{idx + 1}</td>
                                        <td>
                                            <div className="supplier-name-view">
                                                {row.nama_supplier}
                                            </div>
                                        </td>
                                        <td className="fw-semibold text-dark">
                                            {row.no_telp || '-'}
                                        </td>
                                        <td>
                                            <small className="text-muted">
                                                {row.alamat || '-'}
                                            </small>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-5">
                                        <h6 className="fw-bold text-dark">Data Kosong</h6>
                                        <p className="text-muted mb-0">Belum ada data supplier yang terdaftar.</p>
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

export default DaftarSupplier;