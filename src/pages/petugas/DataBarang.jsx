import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import MasterLayout from "../../layouts/MasterLayout";
import "./DataBarang.css";
import { SkeletonTableRows } from "../../components/SkeletonLoader";

const DataBarangPetugas = () => {
  const [barangs, setBarangs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}`, Accept: "application/json" };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/barang", { headers });
      const result = await response.json();

      // Backend biasanya membungkus array di dalam properti 'data'
      setBarangs(result.data || result || []);
    } catch (error) {
      console.error("Gagal mengambil data barang:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Implementasi Live Search yang responsif dan efisien
  const filteredBarangs = useMemo(() => {
    return barangs.filter((barang) => barang.nama_barang?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [barangs, searchQuery]);

  // Fungsi pembantu untuk menentukan klasifikasi status stok barang
  const getStockConfig = (stok) => {
    const totalStok = parseInt(stok) || 0;
    if (totalStok <= 5) {
      return { status: "Hampir Habis", className: "bg-danger-subtle text-danger" };
    } else if (totalStok <= 15) {
      return { status: "Menipis", className: "bg-warning-subtle text-warning" };
    } else {
      return { status: "Tersedia", className: "bg-success-subtle text-success" };
    }
  };

  return (
    <MasterLayout>
      {/* Bagian Judul dan Aksi Utama */}
      <div className="page-title-box d-md-flex align-items-center justify-content-between flex-wrap gap-3">
        <div>
          <h3>📦 Stok Inventaris</h3>
          <p className="text-muted mb-0">Pantau ketersediaan barang Universitas Perjuangan.</p>
        </div>

        <div className="mt-3 mt-md-0 d-flex gap-2 flex-wrap w-sm-100">
          <input type="text" className="search-box" placeholder="Cari nama barang..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />

          {/* Langsung diarahkan ke rute petugas secara absolut */}
          <Link to="/petugas/masuk" className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center">
            <i className="fas fa-plus me-2"></i> Tambah Stok
          </Link>
        </div>
      </div>

      {/* Kontainer Tabel */}
      <div className="card-table">
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th width="60" className="text-center">
                  NO
                </th>
                <th>NAMA BARANG</th>
                <th>KATEGORI</th>
                <th className="text-center">STOK</th>
                <th>HARGA</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <SkeletonTableRows rows={6} columns={6} />
              ) : filteredBarangs.length > 0 ? (
                filteredBarangs.map((row, index) => {
                  const stockConfig = getStockConfig(row.stok);
                  // Membuat padding ID otomatis (contoh: #BRG-0004)
                  const paddedId = String(row.id_barang).padStart(4, "0");

                  return (
                    <tr key={row.id_barang}>
                      <td className="text-center text-muted fw-bold">{index + 1}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="item-icon anonymity-icon me-3">
                            <i className="fas fa-box"></i>
                          </div>
                          <div>
                            <div className="fw-bold text-dark">{row.nama_barang}</div>
                            <small className="text-muted">ID: #BRG-{paddedId}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border-0 px-3 py-2 rounded-pill">
                          <i className="fas fa-tag me-1 text-muted"></i>
                          {row.nama_kategori || "Umum"}
                        </span>
                      </td>
                      <td className="text-center">
                        <h5 className="fw-bold mb-0">{Number(row.stok).toLocaleString("id-ID")}</h5>
                        <small className="text-muted" style={{ fontSize: "10px" }}>
                          {row.satuan}
                        </small>
                      </td>
                      <td>
                        <div className="fw-bold text-dark">Rp {Number(row.harga_beli).toLocaleString("id-ID")}</div>
                        <small className="text-muted">Harga beli</small>
                      </td>
                      <td>
                        <span className={`stok-badge ${stockConfig.className}`}>
                          <i className="fas fa-circle" style={{ fontSize: "6px" }}></i>
                          {stockConfig.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <i className="fas fa-box-open fa-3x text-light mb-3"></i>
                    <p className="text-muted">Belum ada data barang yang sesuai dengan pencarian.</p>
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

export default DataBarangPetugas;
