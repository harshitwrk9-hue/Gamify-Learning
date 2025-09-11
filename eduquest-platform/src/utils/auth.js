/**
 * Generate a random salt for password hashing
 * @returns {string} Base64 encoded salt
 */
const generateSalt = () => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, array));
};

/**
 * Hash a password with salt using PBKDF2
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password with salt
 */
export const hashPassword = async (password) => {
  try {
    const salt = generateSalt();
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    
  
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    
  
    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: encoder.encode(salt),
        iterations: 100000,
        hash: 'SHA-256'
      },
      key,
      256
    );
    
  
    const hashArray = new Uint8Array(hashBuffer);
    const hashBase64 = btoa(String.fromCharCode.apply(null, hashArray));
    
    return `${salt}:${hashBase64}`;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
};

/**
 * Verify a password against a hashed password
 * @param {string} password - Plain text password to verify
 * @param {string} hashedPassword - Stored hashed password with salt
 * @returns {Promise<boolean>} True if password matches
 */
export const verifyPassword = async (password, hashedPassword) => {
  try {
    const [salt, hash] = hashedPassword.split(':');
    
    if (!salt || !hash) {
      throw new Error('Invalid hash format');
    }
    
    const encoder = new TextEncoder();
    
  
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    
  
    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: encoder.encode(salt),
        iterations: 100000,
        hash: 'SHA-256'
      },
      key,
      256
    );
    
  
    const hashArray = new Uint8Array(hashBuffer);
    const computedHash = btoa(String.fromCharCode.apply(null, hashArray));
    
    return computedHash === hash;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with isValid and messages
 */
export const validatePassword = (password) => {
  const messages = [];
  let isValid = true;
  
  if (!password) {
    messages.push('Password is required');
    isValid = false;
  } else {
    if (password.length < 6) {
      messages.push('Password must be at least 6 characters long');
      isValid = false;
    }
    
    if (!/[A-Z]/.test(password)) {
      messages.push('Password should contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      messages.push('Password should contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      messages.push('Password should contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      messages.push('Password should contain at least one special character');
    }
  }
  
  return { isValid, messages };
};

/**
 * Validate username
 * @param {string} username - Username to validate
 * @returns {object} Validation result with isValid and messages
 */
export const validateUsername = (username) => {
  const messages = [];
  let isValid = true;
  
  if (!username) {
    messages.push('Username is required');
    isValid = false;
  } else {
    if (username.length < 3) {
      messages.push('Username must be at least 3 characters long');
      isValid = false;
    }
    
    if (username.length > 20) {
      messages.push('Username must be less than 20 characters');
      isValid = false;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      messages.push('Username can only contain letters, numbers, and underscores');
      isValid = false;
    }
  }
  
  return { isValid, messages };
};

/**
 * Generate a secure session token
 * @returns {string} Random session token
 */
export const generateSessionToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, array));
};