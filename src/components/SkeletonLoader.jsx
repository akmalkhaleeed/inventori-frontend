import React from "react";
import "./SkeletonLoader.css";

/**
 * SkeletonTableRows
 * Menampilkan baris skeleton di dalam <tbody> sebagai pengganti "Memuat data..."
 * agar user tahu sistem sedang bekerja, bukan kosong/eror.
 *
 * Props:
 * - rows: jumlah baris skeleton yang ditampilkan (default 5)
 * - columns: jumlah kolom per baris (default 5)
 */
export const SkeletonTableRows = ({ rows = 5, columns = 5 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <tr key={`skeleton-row-${rowIdx}`} className="skeleton-row">
          {Array.from({ length: columns }).map((__, colIdx) => (
            <td key={`skeleton-col-${colIdx}`}>
              <div className="skeleton-bar" style={{ width: colIdx === 0 ? "40%" : "80%" }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

/**
 * SkeletonCard
 * Skeleton berbentuk kartu, dipakai untuk halaman non-tabel (misal form/riwayat card).
 */
export const SkeletonCard = ({ lines = 3 }) => {
  return (
    <div className="skeleton-card">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={`skeleton-line-${i}`} className="skeleton-bar skeleton-card-line" />
      ))}
    </div>
  );
};

export default SkeletonTableRows;
