import pool from "../config/db.js"; // apne project ke hisaab se path badal lena

/*
  Table structure (ek baar run kar lo):

  CREATE TABLE vendor_ratings (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    vendor_id   INT NOT NULL,
    rating      DECIMAL(2,1) NOT NULL,
    review      VARCHAR(500) NULL,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_rating CHECK (rating >= 0 AND rating <= 5),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
  );
*/

/* Naya rating add karo */
export const addVendorRatingModel = async (vendorId, rating, review = null) => {
  const [result] = await pool.execute(
    `INSERT INTO vendor_ratings (vendor_id, rating, review, created_at, updated_at)
     VALUES (?, ?, ?, NOW(), NOW())`,
    [vendorId, rating, review],
  );
  return result;
};

/* Rating update karo (id se) */
export const updateVendorRatingModel = async (id, rating, review = null) => {
  const [result] = await pool.execute(
    `UPDATE vendor_ratings SET rating = ?, review = ?, updated_at = NOW() WHERE id = ?`,
    [rating, review, id],
  );
  return result;
};

/* Ek vendor ki saari ratings */
export const getVendorRatingsModel = async (vendorId) => {
  const [rows] = await pool.execute(
    `SELECT id, vendor_id, rating, review, created_at, updated_at
     FROM vendor_ratings
     WHERE vendor_id = ?
     ORDER BY created_at DESC`,
    [vendorId],
  );
  return rows;
};

/* Average rating + total count (ek vendor ke liye) */
export const getVendorRatingSummaryModel = async (vendorId) => {
  const [rows] = await pool.execute(
    `SELECT
       vendor_id,
       ROUND(AVG(rating), 1) AS rating,
       COUNT(*) AS total_reviews
     FROM vendor_ratings
     WHERE vendor_id = ?
     GROUP BY vendor_id`,
    [vendorId],
  );
  return rows[0] || { vendor_id: vendorId, rating: null, total_reviews: 0 };
};

/* Saare vendors + unki average rating (vendor table ke liye) */
export const getVendorsWithRatingModel = async () => {
  const [rows] = await pool.execute(
    `SELECT
       v.*,
       ROUND(AVG(r.rating), 1) AS rating,
       COUNT(r.id) AS total_reviews
     FROM vendors v
     LEFT JOIN vendor_ratings r ON r.vendor_id = v.id
     GROUP BY v.id
     ORDER BY v.id DESC`,
  );
  return rows;
};

/* Rating delete karo */
export const deleteVendorRatingModel = async (id) => {
  const [result] = await pool.execute(
    `DELETE FROM vendor_ratings WHERE id = ?`,
    [id],
  );
  return result;
};
