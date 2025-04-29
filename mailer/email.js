const {
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
} = require("./emailTemplate.js");

const sendEmail = require("./email.config.js");

const sendVerificationEmail = async (email, otp) => {
  try {
    const response = await sendEmail(
      email,
      "Verify Your Email",
      VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", otp)
    );
    console.log("Email sent successfully:", response);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error(`Error sending verification email: ${error}`);
  }
};

const sendWelcomeEmail = async (email, name) => {
  try {
    await sendEmail(
      email,
      "Welcome to our platform",
      WELCOME_EMAIL.replace("{userName}", name)
    );
  } catch (err) {
    console.log("Error sending welcome email", err);
    throw new Error("Error sending welcome email");
  }
};

const sendPasswordResetEmail = async (email, resetURL) => {
  try {
    await sendEmail(
      email,
      "Reset your password",
      PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL)
    );
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Error sending password reset email");
  }
};

const sendResetSuccessEmail = async (email) => {
  try {
    await sendEmail(
      email,
      "Password reset successful",
      PASSWORD_RESET_SUCCESS_TEMPLATE
    );
  } catch (error) {
    console.error("Error sending password reset success email:", error);
    throw new Error("Error sending password reset success email");
  }
};

// Export all functions
module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
};
