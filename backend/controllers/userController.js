const generateToken = require("../middleware/authGenerate");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const SibApiV3Sdk = require("sib-api-v3-sdk");
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.SDK_API_KEY;
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
const { v4: uuidv4 } = require("uuid");
const ForgotPassword = require("../models/ForgotPassword");

exports.userSignUp = async (req, res, next) => {
  try {
    const { username, mail, password } = req.body;

    // Hash password
    const hashed = await bcrypt.hash(password, 10);
    if (!hashed) {
      return res
        .status(500)
        .json({ success: false, message: "Password hashing failed" });
    }

    // Create user
    const user = await User.create({ username, mail, password: hashed });
    if (user) {
      const token = generateToken({
        _id: user._id,
        username: user.username,
        isPremium: user.isPremium,
      });
      return res.status(201).json({
        success: true,
        message: "User successfully created",
        token: token,
      });
    } else {
      return res
        .status(500)
        .json({ success: false, message: "Registration failed" });
    }
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong during signup" });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { mail, password } = req.body;
    const user = await User.findOne({ where: { mail } });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const result = await bcrypt.compare(password, user.password);
    if (!result) {
      return res
        .status(401)
        .json({ success: false, message: "Password not matched" });
    }

    const token = generateToken({
      _id: user._id,
      username: user.username,
      isPremium: user.isPremium,
    });

    return res.status(200).json({ success: true, token: token });
  } catch (e) {
    res
      .status(500)
      .json({ success: false, message: "Something went wrong during login" });
  }
};

exports.forgotPassword = async (req, res, next) => {
  const { mail } = req.body;
  const uuid = uuidv4();

  const sendSmtpEmail = {
    to: [{ email: mail }],
    sender: { email: "abdul7to7@gmail.com", name: "Expense_Demo" },
    subject: "Password Reset Request",
    htmlContent: `
      <html>
      <body>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="http://localhost:4000/user/resetpassword/${uuid}">Reset Password</a>
      </body>
      </html>`,
  };

  try {
    const user = await User.findOne({ where: { mail } });
    if (user) {
      await ForgotPassword.create({ id: uuid, userId: user.id });
      await apiInstance.sendTransacEmail(sendSmtpEmail);
      return res
        .status(200)
        .json({ success: true, message: "Password reset email sent" });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error("Error sending email:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error sending reset email" });
  }
};

exports.getResetPassword = async (req, res, next) => {
  const uuid = req.params.uuid;
  const fp = await ForgotPassword.findOne({ where: { id: uuid } });

  if (fp && fp.isActive) {
    return res.status(200).send(`
      <html>
      <body>
        <h2>Enter new password</h2>
        <form action="http://localhost:4000/user/resetpassword" method="POST">
          <input type="hidden" name="uuid" value="${uuid}" />
          <input type="password" name="password" required />
          <button type="submit">Reset Password</button>
        </form>
      </body>
      </html>
    `);
  } else {
    return res
      .status(500)
      .json({ message: "Invalid or expired reset password link" });
  }
};

exports.postResetPassword = async (req, res, next) => {
  const { uuid, password } = req.body;
  const fp = await ForgotPassword.findOne({ where: { id: uuid } });

  if (!fp || !fp.isActive) {
    return res
      .status(400)
      .json({ message: "Invalid or expired reset link", success: false });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    await fp.update({ isActive: false });
    await User.update({ password: hashed }, { where: { id: fp.userId } });

    return res
      .status(200)
      .json({ message: "Password reset successfully", success: true });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error resetting password", success: false });
  }
};
