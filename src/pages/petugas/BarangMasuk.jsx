import React, { useState, useEffect, useMemo } from "react";
import MasterLayout from "../../layouts/MasterLayout";
import Swal from "sweetalert2";
import "./BarangMasukPetugas.css";
import { SkeletonTableRows } from "../../components/SkeletonLoader";

const BarangMasukPetugas = () => {
  const [barangs, setBarangs] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoadingBarang, setIsLoadingBarang] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State untuk Form Input
  const [formData, setFormData] = useState({
    id_barang: "",
    jumlah: "",
    harga_beli: "",
    keterangan: "",
  });

  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // 1. Ambil Data Barang untuk Dropdown Select
  const fetchBarang = async () => {
    setIsLoadingBarang(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/barang", { headers });
      const result = await response.json();
      setBarangs(result.data || result || []);
    } catch (error) {
      console.error("Gagal mengambil data barang:", error);
    } finally {
      setIsLoadingBarang(false);
    }
  };

  // 2. Ambil Data Riwayat Transaksi & Filter Manual untuk Masuk Hari Ini
  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      // Panggil endpoint transaksi umum yang ada di backend
      const response = await fetch("http://127.0.0.1:8000/api/transaksi", { headers });
      const result = await response.json();
      const allTransaksi = result.data || result || [];

      // Dapatkan string tanggal hari ini dengan zona waktu lokal (YYYY-MM-DD)
      const todayDate = new Date();
      // Penyesuaian ke Waktu Indonesia (Asia/Jakarta) secara manual
      const today = new Date(todayDate.getTime() - todayDate.getTimezoneOffset() * 60000).toISOString().split("T")[0];

      // Saring data secara manual
      const filteredHistory = allTransaksi.filter((item) => {
        // Ambil tanggal dari string tanggal_transaksi (Misal: "2026-06-18 14:30:00")
        const itemDate = item.tanggal_transaksi ? item.tanggal_transaksi.split(" ")[0].split("T")[0] : "";
        return item.jenis_transaksi === "masuk" && itemDate === today;
      });

      setHistory(filteredHistory);
    } catch (error) {
      console.error("Gagal mengambil riwayat transaksi:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchBarang();
    fetchHistory();
  }, []);

  // 3. Hitung Total Harga Secara Otomatis
  const totalHarga = useMemo(() => {
    const jumlah = parseFloat(formData.jumlah) || 0;
    const harga = parseFloat(formData.harga_beli) || 0;
    return jumlah * harga;
  }, [formData.jumlah, formData.harga_beli]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 4. Handle Simpan Transaksi Masuk
  const handleSubmit = async (e) => {
    e.preventDefault();

    // PERBAIKAN (Validasi #1): Jumlah barang tidak boleh kurang dari 1 (0 atau negatif).
    // Dicek terpisah agar pesannya spesifik dan jelas bagi user.
    if (!formData.jumlah || parseInt(formData.jumlah) < 1) {
      Swal.fire({
        icon: "warning",
        title: "Input Tidak Valid!",
        text: "Jumlah barang yang dimasukkan minimal harus 1!",
        confirmButtonColor: "#6366f1",
      });
      return;
    }

    if (!formData.id_barang || formData.harga_beli <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Data Tidak Valid!",
        text: "Pastikan barang dan harga beli sudah benar.",
        confirmButtonColor: "#6366f1",
      });
      return;
    }

    setIsSubmitting(true);

    // Ambil ID User dari Local Storage
    const userId = localStorage.getItem("user_id") || localStorage.getItem("userId") || localStorage.getItem("id_user") || 1;

    const payload = {
      id_barang: parseInt(formData.id_barang),
      id_user: parseInt(userId),
      jumlah: parseInt(formData.jumlah),
      harga_beli: parseFloat(formData.harga_beli),
      keterangan: formData.keterangan.trim(),
      jenis_transaksi: "masuk",
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/transaksi", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Stok barang berhasil ditambahkan.",
          confirmButtonColor: "#6366f1",
        });

        // Reset Form
        setFormData({ id_barang: "", jumlah: "", harga_beli: "", keterangan: "" });

        // Refresh Data Dropdown dan Tabel Riwayat
        fetchBarang();
        fetchHistory();
      } else {
        const errResult = await response.json();
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: errResult.message || "Terjadi kesalahan saat menyimpan data.",
          confirmButtonColor: "#6366f1",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Tidak dapat terhubung ke server backend.",
        confirmButtonColor: "#6366f1",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MasterLayout>
      {/* HEADER */}
      <div className="mb-4">
        <h3 className="fw-bold text-dark">Input Barang Masuk</h3>
        <p className="text-muted mb-0">Gunakan form ini untuk menambah stok barang yang baru datang.</p>
      </div>

      <div className="row g-4">
        {/* COLUMN FORM INPUT */}
        <div className="col-lg-5">
          <div className="card-custom">
            <form onSubmit={handleSubmit}>
              {/* PILIH BARANG */}
              <div className="mb-3">
                <label className="form-label">Pilih Barang</label>
                <select name="id_barang" className="form-select text-dark fw-semibold" value={formData.id_barang} onChange={handleInputChange} disabled={isLoadingBarang} required>
                  <option value="">-- Pilih Barang --</option>
                  {barangs.map((b) => (
                    <option key={b.id_barang} value={b.id_barang}>
                      {b.nama_barang} | Stok: {Number(b.stok).toLocaleString("id-ID")} {b.satuan}
                    </option>
                  ))}
                </select>

                <div className="info-box small text-muted">
                  <div className="mb-1">
                    <i className="fa-solid fa-circle-info me-1 text-primary"></i>
                    Pastikan barang yang dipilih sudah benar.
                  </div>
                  <div>Sistem akan otomatis menambahkan stok sesuai jumlah input.</div>
                </div>
              </div>

              {/* JUMLAH */}
              <div className="mb-3">
                <label className="form-label">Jumlah Masuk</label>
                <input type="number" name="jumlah" className="form-control" placeholder="Contoh: 50" min="1" value={formData.jumlah} onChange={handleInputChange} required />
              </div>

              {/* HARGA BELI */}
              <div className="mb-3">
                <label className="form-label">Harga Beli</label>
                <input type="number" name="harga_beli" className="form-control" placeholder="Contoh: 15000" min="1" value={formData.harga_beli} onChange={handleInputChange} required />
              </div>

              {/* TOTAL */}
              <div className="mb-3">
                <label className="form-label">Total Pembelian</label>
                <input type="text" className="form-control bg-light fw-bold text-primary" value={`Rp ${totalHarga.toLocaleString("id-ID")}`} readOnly />
              </div>

              {/* KETERANGAN */}
              <div className="mb-4">
                <label className="form-label">Keterangan</label>
                <textarea name="keterangan" className="form-control" rows="3" placeholder="Contoh: Barang dari supplier pusat" value={formData.keterangan} onChange={handleInputChange}></textarea>
              </div>

              {/* BUTTON SUBMIT */}
              <button type="submit" className="btn btn-primary btn-simpan w-100 d-flex align-items-center justify-content-center" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin me-2"></i>
                    Memproses Transaksi...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>
                    Simpan Transaksi
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* COLUMN RIWAYAT HARI INI */}
        <div className="col-lg-7">
          <div className="card-custom">
            <div className="mb-4">
              <h5 className="fw-bold text-dark mb-1">Riwayat Barang Masuk Hari Ini</h5>
              <p className="text-muted small mb-0">Semua transaksi masuk yang tercatat hari ini.</p>
            </div>

            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr className="small text-muted font-uppercase">
                    <th>Waktu</th>
                    <th>Barang</th>
                    <th>Harga</th>
                    <th>Total</th>
                    <th className="text-end">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingHistory ? (
                    <SkeletonTableRows rows={4} columns={5} />
                  ) : history.length > 0 ? (
                    history.map((row) => {
                      const itemPrice = parseFloat(row.harga_beli) || 0;
                      const itemQty = parseInt(row.jumlah) || 0;
                      const itemTotal = itemPrice * itemQty;

                      // Konversi otomatis waktu UTC dari database ke WIB (Lokal)
                      let timeFormatted = "--:--";
                      if (row.tanggal_transaksi) {
                        // 1. Pastikan format string-nya dikenali sebagai UTC oleh JavaScript
                        let dateString = row.tanggal_transaksi;

                        // Jika format dari Laravel "YYYY-MM-DD HH:mm:ss", ubah jadi standar ISO UTC
                        if (!dateString.includes("T")) {
                          dateString = dateString.replace(" ", "T") + "Z";
                        } else if (!dateString.endsWith("Z")) {
                          dateString += "Z";
                        }

                        // 2. Ubah ke object Date dan format ke WIB (Asia/Jakarta)
                        const dateObj = new Date(dateString);
                        timeFormatted = dateObj
                          .toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                            timeZone: "Asia/Jakarta", // Paksa ke Waktu Indonesia Barat
                          })
                          .replace(".", ":"); // id-ID kadang pakai titik, kita ubah ke titik dua
                      }

                      return (
                        <tr key={row.id_transaksi}>
                          <td className="small text-muted fw-semibold">{timeFormatted} WIB</td>
                          <td>
                            <div className="fw-bold text-dark">{row.barang?.nama_barang || row.nama_barang || "Barang ID: " + row.id_barang}</div>
                            <small className="text-muted d-block text-truncate" style={{ maxWidth: "150px" }}>
                              {row.keterangan || "-"}
                            </small>
                          </td>
                          <td className="fw-semibold text-dark small">Rp {itemPrice.toLocaleString("id-ID")}</td>
                          <td className="fw-bold text-primary small">Rp {itemTotal.toLocaleString("id-ID")}</td>
                          <td className="text-end">
                            <span className="badge bg-success-subtle text-success badge-custom">
                              + {itemQty.toLocaleString("id-ID")} {row.barang?.satuan || row.satuan || ""}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-5 text-muted small">
                        Belum ada input barang masuk hari ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </MasterLayout>
  );
};

export default BarangMasukPetugas;
