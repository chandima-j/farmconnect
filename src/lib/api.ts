const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Security: Input validation and sanitization
const sanitizeInput = (input: any): any => {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, '');
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  return input;
};

// Security: Password strength validation (ISO/IEC 27002 A.9.3.1)
const validatePasswordStrength = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Security: Email validation
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

class SecureApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = this.getStoredToken();
  }

  // Security: Secure token storage
  private getStoredToken(): string | null {
    try {
      return localStorage.getItem('farmconnect_token');
    } catch (error) {
      console.warn('Failed to retrieve token from storage');
      return null;
    }
  }

  private setStoredToken(token: string | null): void {
    try {
      if (token) {
        localStorage.setItem('farmconnect_token', token);
      } else {
        localStorage.removeItem('farmconnect_token');
      }
    } catch (error) {
      console.warn('Failed to store token');
    }
  }

  // Security: Enhanced request method with input sanitization
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Sanitize request body
    let sanitizedBody = options.body;
    if (options.body && typeof options.body === 'string') {
      try {
        const parsed = JSON.parse(options.body);
        const sanitized = sanitizeInput(parsed);
        sanitizedBody = JSON.stringify(sanitized);
      } catch (error) {
        console.warn('Failed to sanitize request body');
      }
    }
    
    // Always get the latest token from localStorage
    const token = localStorage.getItem('farmconnect_token');
    const method = options.method ? options.method.toUpperCase() : 'GET';
    // Use Headers API to guarantee Content-Type
    const headers = new Headers(options.headers || {});
    if (method === 'POST' || method === 'PUT') {
      headers.set('Content-Type', 'application/json');
    }
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    const config: RequestInit = {
      ...options,
      headers,
      body: sanitizedBody,
    };

    console.log('API request headers:', config.headers); // DEBUG LOG

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  setToken(token: string | null) {
    this.token = token;
    this.setStoredToken(token);
  }

  // Security: Enhanced registration with client-side validation
  async register(userData: any) {
    // Client-side validation
    if (!validateEmail(userData.email)) {
      throw new Error('Invalid email format');
    }

    const passwordValidation = validatePasswordStrength(userData.password);
    if (!passwordValidation.isValid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    if (!userData.name || userData.name.trim().length < 1) {
      throw new Error('Name is required');
    }

    if (!userData.userType || !['FARMER', 'BUYER', 'ADMIN'].includes(userData.userType)) {
      throw new Error('Invalid user type');
    }

    // Sanitize user data
    const sanitizedData = sanitizeInput({
      ...userData,
      email: userData.email.toLowerCase().trim(),
      name: userData.name.trim(),
      farmName: userData.farmName?.trim(),
      location: userData.location?.trim(),
      description: userData.description?.trim(),
      address: userData.address?.trim(),
      phone: userData.phone?.trim(),
    });

    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(sanitizedData),
    });
  }

  // Security: Enhanced login with validation
  async login(email: string, password: string) {
    // Client-side validation
    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    if (!password || password.length < 1) {
      throw new Error('Password is required');
    }

    // Sanitize inputs
    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedPassword = password.trim();

    // Fetch CSRF token
    const csrfRes = await fetch(`${this.baseURL}/csrf-token`, { credentials: 'include' });
    if (!csrfRes.ok) throw new Error('Failed to fetch CSRF token');
    const { csrfToken } = await csrfRes.json();

    const response = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ 
        email: sanitizedEmail, 
        password: sanitizedPassword 
      }),
      headers: {
        'X-CSRF-Token': csrfToken,
      },
      credentials: 'include',
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async logout() {
    this.setToken(null);
    // Security: Clear any sensitive data from memory
    this.token = null;
  }

  // Security: Enhanced product methods with input validation
  async getProducts(params?: any) {
    const sanitizedParams = sanitizeInput(params);
    const queryString = sanitizedParams ? `?${new URLSearchParams(sanitizedParams).toString()}` : '';
    return this.request(`/products${queryString}`);
  }

  async getProduct(id: string) {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid product ID');
    }
    return this.request(`/products/${id}`);
  }

  async createProduct(productData: any) {
    // Validate required fields
    if (!productData.name || !productData.price || !productData.category) {
      throw new Error('Product name, price, and category are required');
    }

    const sanitizedData = sanitizeInput(productData);
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(sanitizedData),
    });
  }

  async updateProduct(id: string, productData: any) {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid product ID');
    }

    const sanitizedData = sanitizeInput(productData);
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sanitizedData),
    });
  }

  async deleteProduct(id: string) {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid product ID');
    }

    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Security: Enhanced user methods
  async getFarmers() {
    return this.request('/users/farmers');
  }

  async getFarmer(id: string) {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid farmer ID');
    }
    return this.request(`/users/farmers/${id}`);
  }

  // Security: Enhanced order methods
  async getOrders() {
    return this.request('/orders');
  }

  async createOrder(orderData: any) {
    // Validate required fields
    if (!orderData.items || !orderData.total) {
      throw new Error('Order items and total are required');
    }

    const sanitizedData = sanitizeInput(orderData);
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(sanitizedData),
    });
  }

  async updateOrderStatus(id: string, status: string) {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid order ID');
    }

    if (!status || !['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'].includes(status)) {
      throw new Error('Invalid order status');
    }

    return this.request(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Security: Enhanced admin methods
  async getAdminStats() {
    return this.request('/admin/stats');
  }

  async getAdminUsers(params?: any) {
    const sanitizedParams = sanitizeInput(params);
    const queryString = sanitizedParams ? `?${new URLSearchParams(sanitizedParams).toString()}` : '';
    return this.request(`/admin/users${queryString}`);
  }

  async updateUserStatus(id: string, status: string) {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid user ID');
    }

    if (!status || !['ACTIVE', 'SUSPENDED', 'PENDING'].includes(status)) {
      throw new Error('Invalid user status');
    }

    return this.request(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async getPendingProducts() {
    return this.request('/admin/products/pending');
  }

  async updateProductStatus(id: string, status: string, rejectionReason?: string) {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid product ID');
    }

    if (!status || !['ACTIVE', 'PENDING', 'REJECTED', 'SUSPENDED'].includes(status)) {
      throw new Error('Invalid product status');
    }

    const sanitizedReason = rejectionReason ? sanitizeInput(rejectionReason) : undefined;
    return this.request(`/admin/products/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, rejectionReason: sanitizedReason }),
    });
  }

  // Security: Utility methods
  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    return validatePasswordStrength(password);
  }

  validateEmail(email: string): boolean {
    return validateEmail(email);
  }
}

export const apiClient = new SecureApiClient(API_BASE_URL);