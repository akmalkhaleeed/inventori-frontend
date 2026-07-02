import React, { useState, useEffect, useMemo } from "react";
import MasterLayout from "../../layouts/MasterLayout";
import "./BarangMasuk.css";
import Swal from "sweetalert2";
import { SkeletonTableRows } from "../../components/SkeletonLoader";

const BarangMasuk = () => {
  const [transaksi, setTransaksi] = useState([]);
  const [barangs, setBarangs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    id_barang: "",
    jumlah: "",
    harga_beli: "",
    keterangan: "",
  });

  const totalHarga = useMemo(() => {
    return (parseFloat(formData.harga_beli) || 0) * (parseInt(formData.jumlah) || 0);
  }, [formData.harga_beli, formData.jumlah]);

  const fetchData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}`, Accept: "application/json" };

    try {
      const [resTrans, resBarang] = await Promise.all([fetch("http://127.0.0.1:8000/api/transaksi", { headers }), fetch("http://127.0.0.1:8000/api/barang", { headers })]);

      const dataTrans = await resTrans.json();
      const dataBarang = await resBarang.json();

      const dataMasuk = (dataTrans.data || []).filter((t) => t.jenis_transaksi === "masuk");
      setTransaksi(dataMasuk);
      setBarangs(dataBarang.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // PERBAIKAN (Validasi #1): Jumlah barang tidak boleh kurang dari 1 (0 atau negatif).
    // Blokir submit dan tampilkan peringatan yang jelas ke user.
    const jumlahValue = parseInt(formData.jumlah);
    if (isNaN(jumlahValue) || jumlahValue < 1) {
      Swal.fire({
        icon: "warning",
        title: "Input Tidak Valid!",
        text: "Jumlah barang yang dimasukkan minimal harus 1!",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    const token = localStorage.getItem("token");
    const id_user = localStorage.getItem("id_user");

    // PENGECEKAN PENTING:
    if (!id_user) {
      Swal.fire("Gagal!", "ID User tidak ditemukan. Harap logout dan login kembali.", "error");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      ...formData,
      jumlah: jumlahValue,
      id_user: id_user,
      jenis_transaksi: "masuk",
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/transaksi", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire("Berhasil!", "Transaksi barang masuk disimpan.", "success");
        setShowModal(false);
        setFormData({ id_barang: "", jumlah: "", harga_beli: "", keterangan: "" });
        fetchData();
      } else {
        Swal.fire("Gagal!", result.message || "Periksa kembali input form Anda.", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Server tidak merespon: " + err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MasterLayout>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h3 className="fw-bold mb-0 text-dark">Barang Masuk</h3>
          <p className="text-muted small mb-0">Manajemen penambahan stok inventaris</p>
        </div>
        <button className="btn btn-success rounded-pill px-4 shadow-sm fw-bold" onClick={() => setShowModal(true)}>
          <i className="fa fa-plus-circle me-2"></i> Input Barang Masuk
        </button>
      </div>

      <div className="card overflow-hidden border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4">Tanggal</th>
                <th>Barang</th>
                <th>Jumlah</th>
                <th>Harga Beli</th>
                <th>Total</th>
                <th>Petugas</th>
                <th className="pe-4">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <SkeletonTableRows rows={5} columns={7} />
              ) : transaksi.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    Belum ada transaksi barang masuk.
                  </td>
                </tr>
              ) : (
                transaksi.map((t) => (
                  <tr key={t.id_transaksi}>
                    <td className="ps-4">
                      <span className="fw-bold d-block">{new Date(t.tanggal_transaksi).toLocaleDateString()}</span>
                      <small className="text-muted">{new Date(t.tanggal_transaksi).toLocaleTimeString()} WIB</small>
                    </td>
                    <td className="fw-semibold text-dark">{t.nama_barang || (t.barang && t.barang.nama_barang) || "-"}</td>
                    <td>
                      <span className="badge badge-masuk px-3 py-2 fw-bold">+ {t.jumlah}</span>
                    </td>
                    <td>Rp {Number(t.harga_beli).toLocaleString("id-ID")}</td>
                    <td className="fw-bold text-success">Rp {(t.jumlah * t.harga_beli).toLocaleString("id-ID")}</td>

                    {/* PERBAIKAN: Mengecek berbagai kemungkinan field nama dari relasi backend */}
                    <td>
                      <small className="text-secondary">{t.nama_lengkap || t.name || (t.user && t.user.name) || "Sistem"}</small>
                    </td>

                    <td className="pe-4 small text-muted">{t.keterangan}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal shadow-lg">
            <div className="modal-header border-0 pb-3">
              <h5 className="fw-bold">
                <i className="fa fa-arrow-down-long text-success me-2"></i> Tambah Stok
              </h5>
              <button className="btn-close" onClick={() => setShowModal(false)}></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body pt-0">
              <div className="alert alert-info border-0 small py-2 mb-3">
                <i className="fa fa-info-circle me-1"></i> Barang belum terdaftar?
                <a href="/admin/databarang" className="fw-bold text-decoration-none ms-1">
                  Daftarkan di Master Barang
                </a>
              </div>

              <select name="id_barang" className="form-select mb-3 rounded-3 shadow-sm" required onChange={handleInputChange}>
                <option value="">-- Cari Barang --</option>
                {barangs.map((b) => (
                  <option key={b.id_barang} value={b.id_barang}>
                    {b.nama_barang} (Stok: {b.stok} {b.satuan})
                  </option>
                ))}
              </select>

              <div className="row">
                <div className="col-6">
                  <input type="number" name="jumlah" min="1" step="1" className="form-control mb-3 rounded-3 shadow-sm" placeholder="Jumlah (min. 1)" required value={formData.jumlah} onChange={handleInputChange} />
                </div>
                <div className="col-6">
                  <input type="number" name="harga_beli" min="0" className="form-control mb-3 rounded-3 shadow-sm" placeholder="Harga Beli" required value={formData.harga_beli} onChange={handleInputChange} />
                </div>
              </div>

              <div className="mb-3">
                <label className="small fw-bold">Total Pembelian</label>
                <input type="text" className="form-control bg-light rounded-3 shadow-sm" value={`Rp ${totalHarga.toLocaleString("id-ID")}`} readOnly />
              </div>

              <textarea name="keterangan" className="form-control mb-3 rounded-3 shadow-sm" placeholder="Keterangan..." onChange={handleInputChange} />

              <button type="submit" className="btn btn-success w-100 fw-bold rounded-pill" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <i className="fa fa-spinner fa-spin me-2"></i>Menyimpan...
                  </>
                ) : (
                  "Simpan Stok Masuk"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </MasterLayout>
  );
};
export default BarangMasuk;
