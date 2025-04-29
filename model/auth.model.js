// Import MySQL connection pool
const pool = require('../db/connectDb');

// Utility function to safely handle undefined values in SQL inserts
// If a value is undefined, it replaces it with a fallback (default is null)
const safeValue = (value, fallback = null) => value !== undefined ? value : fallback;

// ✅ Create a new user in the 'users' table with default and optional fields
const createUser = async ({
    email,
    password,
    name,
    phoneNumber,
    termsAccepted = false,            // Defaults to false
    provider = 'email',               // Can be 'email', 'google', etc.
    providerId = null,                // For social login
    isVerified = false,               // User verification status
    profilePicture = null,            // Optional profile picture
    verificationToken = null,         // Token used for email verification (if used)
    verificationTokenExpiresAt = null,// Expiry time for the verification token
    resetPasswordToken = null,        // Token for resetting password
    resetPasswordExpiresAt = null     // Expiry time for password reset token
}) => {
    const query = `
        INSERT INTO users (
            email, password, name, phone_number, terms_accepted,
            provider, provider_id, is_verified, profile_picture,
            verification_token, verification_token_expires_at,
            reset_password_token, reset_password_expires_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Insert the user values using safeValue to avoid undefineds
    const [result] = await pool.execute(query, [
        safeValue(email),
        safeValue(password),
        safeValue(name),
        safeValue(phoneNumber),
        safeValue(termsAccepted),
        safeValue(provider),
        safeValue(providerId),
        safeValue(isVerified),
        safeValue(profilePicture),
        safeValue(verificationToken),
        safeValue(verificationTokenExpiresAt),
        safeValue(resetPasswordToken),
        safeValue(resetPasswordExpiresAt)
    ]);

    // Return the inserted user's ID
    return { id: result.insertId };
};

// ✅ Find a user in the 'users' table by their email address
const findUserByEmail = async (email) => {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null; // Return user if found, otherwise null
};

// ✅ Generate a 6-digit OTP (One Time Password) as a string
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // e.g., "564732"
};

// ✅ Save OTP in the 'otp_verifications' table for a user
// If the user already has an OTP, it will update it (duplicate key strategy)
const saveOTP = async (userId, otp, expiresAt) => {
    const query = `
        INSERT INTO otp_verifications (user_id, otp_code, expires_at)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE otp_code = VALUES(otp_code), expires_at = VALUES(expires_at)
    `;
    const [result] = await pool.execute(query, [userId, otp, expiresAt]);
    return result;
};

// ✅ Verify the latest OTP for a user
// Checks if the OTP matches and is not expired
const verifyOTP = async (userId, otp) => {
    const query = `
        SELECT * FROM otp_verifications 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 1
    `;
    const [results] = await pool.execute(query, [userId]);

    // If no OTP record found
    if (results.length === 0) return false;

    const record = results[0];
    const isValid = record.otp_code === otp && new Date() <= new Date(record.expires_at); // Check code and expiry
    return isValid;
};

// ✅ Mark a user as verified in the 'users' table
const updateVerificationStatus = async (userId) => {
    const query = 'UPDATE users SET is_verified = TRUE WHERE id = ?';
    const [result] = await pool.execute(query, [userId]);
    return result;
};

// Export all functions to be used elsewhere in the app
module.exports = {
    createUser,
    findUserByEmail,
    generateOTP,
    saveOTP,
    verifyOTP,
    updateVerificationStatus
};
