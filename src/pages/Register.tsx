import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Sprout, User, Building, MapPin, Phone, Home, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [searchParams] = useSearchParams();
  const defaultUserType = searchParams.get('type') === 'farmer' ? 'farmer' : 'buyer';
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    userType: defaultUserType as 'farmer' | 'buyer',
    // Farmer fields
    farmName: '',
    location: '',
    description: '',
    // Buyer fields
    address: '',
    phone: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Enhanced password validation to match API requirements
    const passwordErrors = [];
    if (formData.password.length < 8) {
      passwordErrors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(formData.password)) {
      passwordErrors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(formData.password)) {
      passwordErrors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(formData.password)) {
      passwordErrors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      passwordErrors.push('Password must contain at least one special character');
    }
    
    if (passwordErrors.length > 0) {
      setError(`Password validation failed: ${passwordErrors.join(', ')}`);
      return;
    }

    if (formData.userType === 'farmer' && !formData.farmName.trim()) {
      setError('Farm name is required for farmers');
      return;
    }

    if (!formData.name.trim()) {
      setError('Full name is required');
      return;
    }

    // Enhanced email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      // Prepare payload with correct userType and required fields
      const payload: any = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        userType: formData.userType === 'buyer' ? 'BUYER' : 'FARMER',
      };
      if (formData.userType === 'buyer') {
        payload.address = formData.address;
        payload.phone = formData.phone;
      } else if (formData.userType === 'farmer') {
        payload.farmName = formData.farmName;
        payload.location = formData.location;
        payload.description = formData.description;
      }
      console.log('Attempting to register user...');
      const result = await register(payload);
      console.log('Registration result:', result);
      
      if (result.success) {
        navigate('/login?message=Registration successful! Please sign in to continue.');
      } else {
        setError(result.error || 'Registration failed');
        console.error('Registration failed:', result.error);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center space-x-2">
            <Sprout className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">FarmConnect</span>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Email Restrictions Notice */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Email Requirements</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Use a real email address (Gmail, Yahoo, etc.)</li>
                    <li>Avoid test emails like test@gmail.com</li>
                    <li>Try yourname+farmconnect@gmail.com for testing</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                <p className="ml-3 text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* User Type Selection */}
            <div>
              <label className="text-base font-medium text-gray-900">I want to</label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center">
                  <input
                    id="buyer"
                    type="radio"
                    value="buyer"
                    checked={formData.userType === 'buyer'}
                    onChange={(e) => setFormData(prev => ({ ...prev, userType: e.target.value as 'buyer' }))}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <label htmlFor="buyer" className="ml-3 text-sm font-medium text-gray-700">
                    Buy fresh produce from local farmers
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="farmer"
                    type="radio"
                    value="farmer"
                    checked={formData.userType === 'farmer'}
                    onChange={(e) => setFormData(prev => ({ ...prev, userType: e.target.value as 'farmer' }))}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <label htmlFor="farmer" className="ml-3 text-sm font-medium text-gray-700">
                    Sell my farm produce to city buyers
                  </label>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <div className="mt-1 relative">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 pl-10 placeholder-gray-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                    placeholder="Enter your full name"
                  />
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                    placeholder="yourname@gmail.com or yourname+test@gmail.com"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Use a real email address. For testing, try adding +test before @
                </p>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 pr-10 placeholder-gray-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                    placeholder="Create a password (min 8 characters, uppercase, lowercase, number, special char)"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {/* Password strength indicator */}
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    <div className="text-xs text-gray-600">Password requirements:</div>
                    <div className="space-y-1">
                      <div className={`flex items-center text-xs ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                        {formData.password.length >= 8 ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                        At least 8 characters
                      </div>
                      <div className={`flex items-center text-xs ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                        {/[A-Z]/.test(formData.password) ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                        One uppercase letter
                      </div>
                      <div className={`flex items-center text-xs ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                        {/[a-z]/.test(formData.password) ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                        One lowercase letter
                      </div>
                      <div className={`flex items-center text-xs ${/\d/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                        {/\d/.test(formData.password) ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                        One number
                      </div>
                      <div className={`flex items-center text-xs ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                        {/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                        One special character
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password *
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 pr-10 placeholder-gray-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Farmer-specific fields */}
            {formData.userType === 'farmer' && (
              <div className="space-y-4 border-t border-gray-200 pt-4">
                <h3 className="text-lg font-medium text-gray-900">Farm Information</h3>
                
                <div>
                  <label htmlFor="farmName" className="block text-sm font-medium text-gray-700">
                    Farm Name *
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="farmName"
                      name="farmName"
                      type="text"
                      required
                      value={formData.farmName}
                      onChange={handleInputChange}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 pl-10 placeholder-gray-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                      placeholder="e.g., Green Valley Farm"
                    />
                    <Building className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Farm Location
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="location"
                      name="location"
                      type="text"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 pl-10 placeholder-gray-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                      placeholder="e.g., Sonoma County, CA"
                    />
                    <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Farm Description
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                      placeholder="Tell buyers about your farm and farming practices..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Buyer-specific fields */}
            {formData.userType === 'buyer' && (
              <div className="space-y-4 border-t border-gray-200 pt-4">
                <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
                
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="address"
                      name="address"
                      type="text"
                      autoComplete="address"
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 pl-10 placeholder-gray-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                      placeholder="Your delivery address"
                    />
                    <Home className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 pl-10 placeholder-gray-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                      placeholder="Your phone number"
                    />
                    <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  By creating an account, you agree to our Terms of Service
                </span>
              </div>
            </div>
          </div>

          {/* Development Tips */}
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Development Tips</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>For testing, use real email formats like:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>yourname+farmer@gmail.com</li>
                    <li>yourname+buyer@gmail.com</li>
                    <li>yourname.test@gmail.com</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}