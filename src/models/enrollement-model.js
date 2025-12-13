/**
 * Enrollment Model
 * Database operations for enrollments table
 */

const { query } = require('../config/db-config');
const { NotFoundError, ConflictError } = require('../utils/error-utils');
const logger = require('../config/logger-config');

/**
 * Create new enrollment
 * @param {Object} enrollmentData - Enrollment data
 * @returns {Promise<Object>}
 */
const create = async (enrollmentData) => {
  const {
    userId,
    skill,
    classLocation,
    scholarshipType,
    coursePrice,
    finalPrice
  } = enrollmentData;
  
  const sql = `
    INSERT INTO enrollments (
      user_id, skill, class_location, scholarship_type, 
      course_price, final_price
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  
  try {
    const result = await query(sql, [
      userId,
      skill,
      classLocation,
      scholarshipType,
      coursePrice,
      finalPrice
    ]);
    
    logger.info('Enrollment created', {
      enrollmentId: result.rows[0].id,
      userId,
      skill
    });
    
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      throw new ConflictError('User already enrolled in this course');
    }
    throw error;
  }
};

/**
 * Find enrollment by ID
 * @param {string} enrollmentId - Enrollment ID
 * @returns {Promise<Object|null>}
 */
const findById = async (enrollmentId) => {
  const sql = `
    SELECT e.*, u.full_name, u.email, u.phone_number
    FROM enrollments e
    INNER JOIN users u ON e.user_id = u.id
    WHERE e.id = $1
  `;
  
  const result = await query(sql, [enrollmentId]);
  return result.rows[0] || null;
};

/**
 * Find enrollments by user ID
 * @param {string} userId - User ID
 * @returns {Promise<Array>}
 */
const findByUserId = async (userId) => {
  const sql = `
    SELECT *
    FROM enrollments
    WHERE user_id = $1
    ORDER BY created_at DESC
  `;
  
  const result = await query(sql, [userId]);
  return result.rows;
};

/**
 * Find enrollment by user and skill
 * @param {string} userId - User ID
 * @param {string} skill - Skill/Course
 * @returns {Promise<Object|null>}
 */
const findByUserAndSkill = async (userId, skill) => {
  const sql = `
    SELECT *
    FROM enrollments
    WHERE user_id = $1 AND skill = $2
  `;
  
  const result = await query(sql, [userId, skill]);
  return result.rows[0] || null;
};

/**
 * Update enrollment
 * @param {string} enrollmentId - Enrollment ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>}
 */
const update = async (enrollmentId, updates) => {
  const allowedFields = [
    'class_location',
    'enrollment_status',
    'start_date',
    'end_date',
    'notes'
  ];
  
  const fields = [];
  const values = [];
  let paramCounter = 1;
  
  Object.keys(updates).forEach(key => {
    if (allowedFields.includes(key)) {
      fields.push(`${key} = $${paramCounter}`);
      values.push(updates[key]);
      paramCounter++;
    }
  });
  
  if (fields.length === 0) {
    throw new Error('No valid fields to update');
  }
  
  values.push(enrollmentId);
  
  const sql = `
    UPDATE enrollments
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${paramCounter}
    RETURNING *
  `;
  
  const result = await query(sql, values);
  
  if (result.rows.length === 0) {
    throw new NotFoundError('Enrollment not found');
  }
  
  logger.info('Enrollment updated', {
    enrollmentId,
    fields: Object.keys(updates)
  });
  
  return result.rows[0];
};

/**
 * Update total paid amount
 * @param {string} enrollmentId - Enrollment ID
 * @param {number} amount - Amount to add
 * @returns {Promise<Object>}
 */
const updateTotalPaid = async (enrollmentId, amount) => {
  const sql = `
    UPDATE enrollments
    SET total_paid = total_paid + $1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `;
  
  const result = await query(sql, [amount, enrollmentId]);
  
  if (result.rows.length === 0) {
    throw new NotFoundError('Enrollment not found');
  }
  
  return result.rows[0];
};

/**
 * Update payment status
 * @param {string} enrollmentId - Enrollment ID
 * @param {string} status - Payment status
 * @returns {Promise<Object>}
 */
const updatePaymentStatus = async (enrollmentId, status) => {
  const sql = `
    UPDATE enrollments
    SET payment_status = $1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `;
  
  const result = await query(sql, [status, enrollmentId]);
  
  if (result.rows.length === 0) {
    throw new NotFoundError('Enrollment not found');
  }
  
  logger.info('Enrollment payment status updated', {
    enrollmentId,
    status
  });
  
  return result.rows[0];
};

/**
 * Issue certificate
 * @param {string} enrollmentId - Enrollment ID
 * @param {string} certificateUrl - Certificate URL
 * @returns {Promise<Object>}
 */
const issueCertificate = async (enrollmentId, certificateUrl) => {
  const sql = `
    UPDATE enrollments
    SET certificate_issued = true,
        certificate_url = $1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `;
  
  const result = await query(sql, [certificateUrl, enrollmentId]);
  
  if (result.rows.length === 0) {
    throw new NotFoundError('Enrollment not found');
  }
  
  logger.info('Certificate issued', { enrollmentId });
  return result.rows[0];
};

/**
 * Get all enrollments with pagination
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
const findAll = async (options = {}) => {
  const {
    page = 1,
    limit = 10,
    skill = null,
    scholarshipType = null,
    paymentStatus = null,
    enrollmentStatus = null
  } = options;
  
  const offset = (page - 1) * limit;
  const conditions = [];
  const values = [];
  let paramCounter = 1;
  
  if (skill) {
    conditions.push(`e.skill = $${paramCounter}`);
    values.push(skill);
    paramCounter++;
  }
  
  if (scholarshipType) {
    conditions.push(`e.scholarship_type = $${paramCounter}`);
    values.push(scholarshipType);
    paramCounter++;
  }
  
  if (paymentStatus) {
    conditions.push(`e.payment_status = $${paramCounter}`);
    values.push(paymentStatus);
    paramCounter++;
  }
  
  if (enrollmentStatus) {
    conditions.push(`e.enrollment_status = $${paramCounter}`);
    values.push(enrollmentStatus);
    paramCounter++;
  }
  
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  
  const countSql = `
    SELECT COUNT(*) 
    FROM enrollments e
    ${whereClause}
  `;
  
  const dataSql = `
    SELECT e.*, u.full_name, u.email, u.phone_number
    FROM enrollments e
    INNER JOIN users u ON e.user_id = u.id
    ${whereClause}
    ORDER BY e.created_at DESC
    LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
  `;
  
  const countResult = await query(countSql, values);
  const dataResult = await query(dataSql, [...values, limit, offset]);
  
  return {
    enrollments: dataResult.rows,
    pagination: {
      page,
      limit,
      total: parseInt(countResult.rows[0].count, 10),
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    }
  };
};

/**
 * Get enrollment statistics
 * @returns {Promise<Object>}
 */
const getStatistics = async () => {
  const sql = `
    SELECT 
      COUNT(*) as total_enrollments,
      COUNT(CASE WHEN enrollment_status = 'active' THEN 1 END) as active_enrollments,
      COUNT(CASE WHEN enrollment_status = 'completed' THEN 1 END) as completed_enrollments,
      COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as fully_paid,
      COUNT(CASE WHEN payment_status = 'partial' THEN 1 END) as partially_paid,
      COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_payment,
      SUM(total_paid) as total_revenue,
      AVG(total_paid) as average_payment
    FROM enrollments
  `;
  
  const result = await query(sql);
  return result.rows[0];
};

/**
 * Get enrollments by skill
 * @returns {Promise<Array>}
 */
const countBySkill = async () => {
  const sql = `
    SELECT skill, COUNT(*) as count
    FROM enrollments
    GROUP BY skill
    ORDER BY count DESC
  `;
  
  const result = await query(sql);
  return result.rows;
};

/**
 * Get enrollments by scholarship type
 * @returns {Promise<Array>}
 */
const countByScholarship = async () => {
  const sql = `
    SELECT scholarship_type, COUNT(*) as count
    FROM enrollments
    GROUP BY scholarship_type
    ORDER BY count DESC
  `;
  
  const result = await query(sql);
  return result.rows;
};

/**
 * Delete enrollment
 * @param {string} enrollmentId - Enrollment ID
 * @returns {Promise<boolean>}
 */
const deleteById = async (enrollmentId) => {
  const sql = `
    DELETE FROM enrollments
    WHERE id = $1
    RETURNING id
  `;
  
  const result = await query(sql, [enrollmentId]);
  
  if (result.rows.length === 0) {
    throw new NotFoundError('Enrollment not found');
  }
  
  logger.info('Enrollment deleted', { enrollmentId });
  return true;
};

module.exports = {
  create,
  findById,
  findByUserId,
  findByUserAndSkill,
  update,
  updateTotalPaid,
  updatePaymentStatus,
  issueCertificate,
  findAll,
  getStatistics,
  countBySkill,
  countByScholarship,
  deleteById
};