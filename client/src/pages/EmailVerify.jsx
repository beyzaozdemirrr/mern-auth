import React, { useContext, useEffect } from 'react';
import axios from 'axios';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const EmailVerify = () => {
  const { backendUrl, getUserData, isLoggedin, userData } = useContext(AppContext);

  const navigate = useNavigate();
  const inputRefs = React.useRef([]);

  // axios ile cookie’leri her istekte göndermek için
  useEffect(() => {
    axios.defaults.withCredentials = true;
  }, []);

  // Kullanıcı bir karakter girdiğinde otomatik olarak sonraki input’a geçer
  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Backspace ile boş bir input’ta geri gidildiğinde önceki input’a geçer
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Kullanıcı OTP’yi yapıştırdığında otomatik olarak kutulara dağıtır
  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').slice(0, 6); // max 6 karakter al
    const pasteArray = paste.split('');
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };

  // Form gönderildiğinde OTP’yi toplayıp API’ye gönderir
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const otpArray = inputRefs.current.map((el) => el.value);
      const otp = otpArray.join('');

      // Boş veya eksik OTP kontrolü
      if (otp.length < 6) {
        toast.error('Please enter the 6-digit OTP.');
        return;
      }

      const { data } = await axios.post(`${backendUrl}/api/auth/verify-account`, { otp });

      if (data.success) {
        toast.success(data.message);
        await getUserData(); // Kullanıcı verilerini tekrar çek
        navigate('/'); // Ana sayfaya yönlendir
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  useEffect(()=>{
    isLoggedin && userData && userData.isAccountVerified && navigate('/')
  }, [isLoggedin,userData])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400">
      
      <img
        onClick={() => navigate('/')}
        src={assets.logo}
        alt="Logo"
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />

      {/* OTP doğrulama formu */}
      <form
        onSubmit={onSubmitHandler}
        className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
      >
        <h1 className="text-white text-2xl font-semibold text-center mb-4">Email Verify OTP</h1>
        <p className="text-center mb-6 text-indigo-300">
          Enter the 6-digit code sent to your email id.
        </p>

        {/* OTP giriş kutuları */}
        <div className="flex justify-between mb-8" onPaste={handlePaste}>
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <input
                type="text"
                maxLength="1"
                key={index}
                required
                className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md"
                ref={(el) => (inputRefs.current[index] = el)}
                onInput={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            ))}
        </div>

        {/* Gönderme butonu */}
        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full"
        >
          Verify email
        </button>
      </form>
    </div>
  );
};

export default EmailVerify;
