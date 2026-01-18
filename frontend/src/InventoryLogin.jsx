import { useState } from 'react';
import { Mail, Lock, Fingerprint } from 'lucide-react';
import './InventoryLogin.css';

export default function InventoryLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simple validation
    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      // TODO: Replace with actual API call to your backend
      // For now, we'll simulate a successful login
      setTimeout(() => {
        // Store credentials (in production, use secure token)
        localStorage.setItem('user_email', email);
        localStorage.setItem('is_logged_in', 'true');
        
        if (onLoginSuccess) {
          onLoginSuccess(email);
        }
        
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };

  // Generate random buffer for WebAuthn challenges
  const generateRandomBuffer = (size = 32) => {
    const buffer = new Uint8Array(size);
    crypto.getRandomValues(buffer);
    return buffer;
  };

  // Convert ArrayBuffer to Base64
  const bufferToBase64 = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Convert Base64 to ArrayBuffer
  const base64ToBuffer = (base64) => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  };

  const handleTouchIdLogin = async () => {
    setError('');
    setLoading(true);

    const AUTHORIZED_EMAIL = 'asyhabdullah7@gmail.com';

    try {
      // Check if browser supports WebAuthn
      if (!window.PublicKeyCredential) {
        setError('TouchID is not supported on this browser');
        setLoading(false);
        return;
      }

      // Check if platform authenticator is available (macOS TouchID, Windows Hello, etc.)
      const isAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!isAvailable) {
        setError('TouchID is not available on this device. Make sure you have a compatible MacBook with TouchID enabled.');
        setLoading(false);
        return;
      }

      // Try to get existing credential
      const savedEmail = localStorage.getItem('user_email_touchid');

      if (savedEmail === AUTHORIZED_EMAIL) {
        // User has already registered TouchID, authenticate them
        try {
          const allowCredentials = JSON.parse(localStorage.getItem('touchid_credentials') || '[]');

          const assertion = await navigator.credentials.get({
            mediation: 'optional',
            publicKey: {
              challenge: generateRandomBuffer(),
              rpId: window.location.hostname,
              allowCredentials: allowCredentials.map(cred => ({
                id: new Uint8Array(base64ToBuffer(cred.id)),
                type: 'public-key',
              })),
              userVerification: 'preferred',
              timeout: 60000,
              transports: ['internal'], // macOS TouchID only
            },
          });

          if (assertion) {
            localStorage.setItem('user_email', AUTHORIZED_EMAIL);
            localStorage.setItem('is_logged_in', 'true');

            if (onLoginSuccess) {
              onLoginSuccess(AUTHORIZED_EMAIL);
            }

            setLoading(false);
            return;
          }
        } catch (authErr) {
          // Fall through to registration if authentication fails
          console.log('Authentication attempt failed, trying registration');
        }
      }

      // First time setup: Register new TouchID credential for authorized email
      try {
        const credential = await navigator.credentials.create({
          publicKey: {
            challenge: generateRandomBuffer(),
            rp: {
              name: 'FraudSentry',
              id: window.location.hostname,
            },
            user: {
              id: generateRandomBuffer(),
              name: AUTHORIZED_EMAIL,
              displayName: AUTHORIZED_EMAIL.split('@')[0],
            },
            pubKeyCredParams: [
              { type: 'public-key', alg: -7 },  // ES256
              { type: 'public-key', alg: -257 }, // RS256
            ],
            authenticatorSelection: {
              authenticatorAttachment: 'platform', // macOS TouchID
              userVerification: 'preferred',
              residentKey: 'preferred',
            },
            timeout: 60000,
            attestation: 'direct',
          },
        });

        if (credential) {
          // Save credential info for future authentication
          const credentialData = {
            id: bufferToBase64(credential.id),
            type: credential.type,
          };

          const existingCredentials = JSON.parse(localStorage.getItem('touchid_credentials') || '[]');
          existingCredentials.push(credentialData);

          localStorage.setItem('touchid_credentials', JSON.stringify(existingCredentials));
          localStorage.setItem('user_email_touchid', AUTHORIZED_EMAIL);
          localStorage.setItem('user_email', AUTHORIZED_EMAIL);
          localStorage.setItem('is_logged_in', 'true');

          if (onLoginSuccess) {
            onLoginSuccess(AUTHORIZED_EMAIL);
          }

          setLoading(false);
        } else {
          setError('TouchID registration was cancelled');
          setLoading(false);
        }
      } catch (regErr) {
        console.error('Registration error:', regErr);
        setError('Failed to register TouchID. Please use password login.');
        setLoading(false);
      }
    } catch (err) {
      console.error('TouchID error:', err);

      if (err.name === 'NotAllowedError') {
        setError('TouchID authentication was denied or cancelled');
      } else if (err.name === 'NotSupportedError') {
        setError('TouchID is not supported on this browser');
      } else if (err.name === 'NetworkError') {
        setError('Network error occurred');
      } else {
        setError('TouchID authentication failed. Please try password login instead.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Background gradient */}
      <div className="login-background"></div>

      {/* Main card */}
      <div className="login-card">
        {/* Left Column - Form */}
        <div className="login-form-column">
          <div className="login-form-content">
            {/* Header */}
            <div className="login-header">
              <img 
                src="/FraudSentryLogo.png" 
                alt="FraudSentry Logo" 
                className="login-logo"
              />
              <h1 className="login-title">Welcome Back</h1>
              <p className="login-subtitle">Sign in to your FraudSentry account</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="login-error">
                <span className="error-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="login-form">
              {/* Email Field */}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={20} />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" disabled={loading} />
                  <span>Remember me</span>
                </label>
                <a href="#" className="forgot-password">
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="button-spinner"></span>
                    <span>Signing in...</span>
                  </>
                ) : (
                  'Log In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="form-divider">
              <span>or</span>
            </div>

            {/* TouchID / Biometric Login */}
            <button
              type="button"
              className="biometric-button"
              onClick={handleTouchIdLogin}
              disabled={loading}
            >
              <Fingerprint size={24} />
              <span>Sign in with TouchID</span>
            </button>

            {/* Sign Up Link */}
            <div className="login-footer">
              <p>Don't have an account? <a href="#">Sign up here</a></p>
            </div>
          </div>
        </div>

        {/* Right Column - Illustration */}
        <div className="login-illustration-column">
          <div className="illustration-container">
            {/* Decorative Background Shape */}
            <div className="illustration-bg-shape"></div>

            {/* Illustration Content */}
            <div className="illustration-content">
              <div className="illustration-icon">🔐</div>
              <h2 className="illustration-title">Secure & Reliable</h2>
              <p className="illustration-text">
                FraudSentry provides enterprise-grade fraud detection powered by AI and machine learning.
              </p>

              {/* Feature List */}
              <ul className="illustration-features">
                <li>
                  <span className="feature-check">✓</span>
                  Real-time fraud detection
                </li>
                <li>
                  <span className="feature-check">✓</span>
                  Dual-model validation
                </li>
                <li>
                  <span className="feature-check">✓</span>
                  AI-powered insights
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
