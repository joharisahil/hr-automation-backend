const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const {
    findUserByEmail,
    createUser,
    saveOTP,
    verifyOTP,
    updateVerificationStatus,
    saveResetToken,
    updatePassword,
} = require("../model/auth.model");

const {
    sendVerificationEmail,
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendResetSuccessEmail
} = require("../mailer/email");

const { generateTokenAndSetCookie } = require("../utils/generateToken");

// Signup function
// This registers a new user, hashes their password, saves them to the DB, sends OTP via email, and sets a token cookie.
const signup = async (req, res) => {
    const { email, password, name, phoneNumber, termsAccepted } = req.body;

    if (!email || !password || !name || !phoneNumber || !termsAccepted) {
        return res.status(400).json({ message: "All fields are required and terms must be accepted." });
    }

    try {
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await createUser({
            email,
            password: hashedPassword,
            name,
            phoneNumber,
            termsAccepted
        });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

        await saveOTP(newUser.id, otp, expiresAt); // Save OTP to DB
        await sendVerificationEmail(email, otp); // Send OTP to user's email

        generateTokenAndSetCookie(res, newUser.id); // Set auth token in cookie

        return res.status(201).json({ success: true, message: "User created. OTP sent to email.", userId: newUser.id });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Verify OTP function
// This verifies the OTP sent to the user's email and updates the user's verification status in DB.
const verifyOtp = async (req, res) => {
    const { userId, otp, email } = req.body;
    if (!userId || !otp || !email) return res.status(400).json({ message: "Missing fields" });

    const isValid = await verifyOTP(userId, otp);
    if (!isValid) return res.status(400).json({ message: "Invalid or expired OTP" });

    await updateVerificationStatus(userId); // Mark user as verified
    const user = await findUserByEmail(email);
    await sendWelcomeEmail(user.email, user.name); // Send welcome email

    res.status(200).json({ success: true, message: "OTP verified. User is verified." });
};

// Resend OTP function
// This generates and sends a new OTP to the user's email.
const resendOtp = async (req, res) => {
    const { userId, email } = req.body;
    if (!userId || !email) return res.status(400).json({ message: "User ID and email are required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes
    await saveOTP(userId, otp, expiresAt); // Save new OTP to DB
    await sendVerificationEmail(email, otp); // Send new OTP via email

    res.status(200).json({ success: true, message: "New OTP sent to your email" });
};

// Login function
// This checks email and password, and logs the user in by setting a token cookie.
const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    generateTokenAndSetCookie(res, user.id); // Set auth token in cookie
    res.status(200).json({
        success: true,
        message: "Logged in successfully",
        user: {
            id: user.id,
            email: user.email,
            name: user.name
        }
    });
};

// Logout function
// This clears the token cookie to log the user out.
const logout = (req, res) => {
    res.clearCookie("token"); // Remove auth token cookie
    res.status(200).json({ success: true, message: "Logged out successfully" });
};

// Forgot Password function
// This generates a password reset token and emails the reset link to the user.
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await findUserByEmail(email);
    if (!user) return res.status(400).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(20).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // Token valid for 1 hour
    await saveResetToken(user.id, resetToken, expiresAt); // Save reset token to DB

    await sendPasswordResetEmail(email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`); // Send reset link
    res.status(200).json({ success: true, message: "Password reset link sent to your email" });
};

// Reset Password function
// This allows user to set a new password using the reset token.
const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); // Hash new password

    const updated = await updatePassword(token, hashedPassword); // Update password in DB using token
    if (!updated) return res.status(400).json({ message: "Invalid or expired token" });

    await sendResetSuccessEmail(updated.email); // Notify user of successful reset
    res.status(200).json({ success: true, message: "Password reset successful" });
};

// Check Auth function
// This checks if the user is authenticated by fetching them from the DB.
const checkAuth = async (req, res) => {
    try {
        const user = await findUserByEmail(req.userEmail);
        if (!user) return res.status(400).json({ message: "User not found" });

        res.status(200).json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    signup,        // Registers new users and sends OTP
    verifyOtp,     // Verifies OTP and activates account
    resendOtp,     // Sends a new OTP to the user
    login,         // Logs in the user by setting a cookie
    logout,        // Logs out the user by clearing the cookie
    forgotPassword,// Sends password reset link via email
    resetPassword, // Updates user's password using reset token
    checkAuth      // Verifies if user is authenticated
};
