import { useState } from 'react';
import { forgotPasswordApi, verifyOtpApi, resetPasswordApi } from '../api/authApi';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const ic = "w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-600 transition bg-slate-50 text-sm";

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!emailInput) return toast.error('Enter your email');
    setLoading(true);
    try {
      const res = await forgotPasswordApi({ email: emailInput });
      setEmail(emailInput);
      setStep(2);
      toast.success('OTP sent! Check your email.');
      if (res.data.dev_otp) {
        console.log('DEV OTP:', res.data.dev_otp);
        toast(`DEV OTP: ${res.data.dev_otp}`, { icon: '🔑', duration: 10000 });
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to send OTP. Make sure the email is registered.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpInput || otpInput.length < 6) return toast.error('Enter the 6-digit OTP');
    setLoading(true);
    try {
      await verifyOtpApi({ email, otp: otpInput });
      setOtp(otpInput);
      setStep(3);
      toast.success('OTP verified! Set your new password.');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return toast.error("Passwords don't match!");
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const res = await resetPasswordApi({ email, otp, newPassword });
      toast.success(res.data.message);
      navigate('/login');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 py-12 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(15,118,110,0.15),transparent_50%)]" />
      <div className="relative max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-8 h-8 bg-teal-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">CB</div>
          <h1 className="text-2xl font-bold text-slate-800">CareerBridge</h1>
        </div>
        <h2 className="text-center text-lg font-semibold text-slate-700 mb-1">Reset Password</h2>
        <p className="text-center text-slate-400 text-sm mb-6">
          {step === 1 && 'Enter your registered email to receive an OTP.'}
          {step === 2 && `Enter the 6-digit OTP sent to ${email}`}
          {step === 3 && 'Create a strong new password.'}
        </p>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {['Email', 'Verify OTP', 'New Password'].map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex flex-col items-center`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${step > i + 1 ? 'bg-teal-700 border-teal-700 text-white' : step === i + 1 ? 'border-teal-700 text-teal-700 bg-teal-50' : 'border-slate-300 text-slate-400 bg-white'}`}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span className={`text-[10px] mt-1 font-medium ${step === i + 1 ? 'text-teal-700' : 'text-slate-400'}`}>{label}</span>
              </div>
              {i < 2 && <div className={`w-8 h-0.5 mb-4 ${step > i + 1 ? 'bg-teal-700' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1 - Email */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email" required value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                className={ic} placeholder="your@email.com"
              />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-teal-700 text-white font-semibold rounded-lg px-4 py-3 hover:bg-teal-800 transition disabled:opacity-50">
              {loading ? 'Sending OTP...' : 'Send OTP →'}
            </button>
          </form>
        )}

        {/* Step 2 - OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-center mb-2">
              <p className="text-teal-700 text-xs font-medium">📧 OTP sent to <strong>{email}</strong></p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">6-Digit OTP</label>
              <input
                type="text" required value={otpInput} maxLength={6}
                onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                className={ic + " text-center text-xl tracking-[0.4em] font-bold"}
                placeholder="• • • • • •"
              />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-teal-700 text-white font-semibold rounded-lg px-4 py-3 hover:bg-teal-800 transition disabled:opacity-50">
              {loading ? 'Verifying...' : 'Verify OTP →'}
            </button>
            <button type="button" onClick={() => setStep(1)} className="w-full text-sm text-slate-400 hover:text-slate-600 transition py-2">
              ← Back to Email
            </button>
          </form>
        )}

        {/* Step 3 - New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
              <input
                type="password" required value={newPassword} minLength={6}
                onChange={e => setNewPassword(e.target.value)}
                className={ic} placeholder="Minimum 6 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
              <input
                type="password" required value={confirmPassword} minLength={6}
                onChange={e => setConfirmPassword(e.target.value)}
                className={ic} placeholder="Re-enter password"
              />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-teal-700 text-white font-semibold rounded-lg px-4 py-3 hover:bg-teal-800 transition disabled:opacity-50">
              {loading ? 'Resetting...' : 'Reset Password ✓'}
            </button>
          </form>
        )}

        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <Link to="/login" className="text-sm text-teal-700 hover:underline font-medium">← Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
