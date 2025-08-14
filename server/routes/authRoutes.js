import express from 'express';
import { 
  register, login, logout, sendVerifyOtp, verifyEmail, isAuthenticated,
  sendResetOtp, resetPassword
} from '../controllers/authController.js';
import userAuth from '../middleware/userAuth.js';

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp);
authRouter.post('/verify-account', userAuth, verifyEmail);
authRouter.get('/is-auth', userAuth, isAuthenticated);

// 🔹 Reset password routes
authRouter.post('/send-reset-otp', sendResetOtp);        // OTP gönderme
authRouter.post('/verify-reset-otp', (req, res, next) => { // OTP doğrulama
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ success: false, message: "Email and OTP required" });

  next();
}, async (req, res) => {
  const { email, otp } = req.body;
  const user = await (await import('../models/userModel.js')).default.findOne({ email });

  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  if (user.resetOtp !== otp || user.resetOtpExpireAt < Date.now()) {
    return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
  }

  res.json({ success: true, message: "OTP verified!" });
});

authRouter.post('/reset-password', resetPassword);

export default authRouter;
