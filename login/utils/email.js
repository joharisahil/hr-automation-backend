const {
  PASSWORD_RESET_REQUEST_TEMPLATE,
 // PASSWORD_RESET_SUCCESS_TEMPLATE,
} = require("./emailTemplate.js");

const sendEmail = require("./mail.config.js");




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

// const sendResetSuccessEmail = async (email) => {
//   try {
//     await sendEmail(
//       email,
//       "Password reset successful",
//       PASSWORD_RESET_SUCCESS_TEMPLATE
//     );
//   } catch (error) {
//     console.error("Error sending password reset success email:", error);
//     throw new Error("Error sending password reset success email");
//   }
// };

module.exports = {
  sendPasswordResetEmail,
//   sendResetSuccessEmail,
};
