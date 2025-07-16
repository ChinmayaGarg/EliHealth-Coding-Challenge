// src/queries/testStripQueries.ts

export const INSERT_SUBMISSION = `
  INSERT INTO test_strip_submissions (
    qr_code, original_image_path, thumbnail_path,
    image_size, image_dimensions, status
  ) VALUES ($1, $2, $3, $4, $5, $6)
`;

export const SELECT_HISTORY = `
  SELECT id, status, thumbnail_path AS filename, qr_code AS "qrCode", created_at 
  FROM test_strip_submissions 
  ORDER BY created_at DESC
`;

export const SELECT_BY_ID = `
  SELECT * FROM test_strip_submissions WHERE id = $1
`;

export const SELECT_PAGINATED = `
  SELECT id, qr_code, status, thumbnail_path, image_size, image_dimensions, created_at
  FROM test_strip_submissions
  ORDER BY created_at DESC
  LIMIT $1 OFFSET $2
`;
