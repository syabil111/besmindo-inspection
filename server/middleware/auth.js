import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token tidak ditemukan. Silakan login terlebih dahulu.'
    });
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'besmindo_secret_jwt_key_default_2026';
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Token tidak valid atau sudah kadaluarsa.'
    });
  }
};

export const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User tidak terautentikasi.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses ke halaman ini.'
      });
    }

    next();
  };
};

// Shorthand for admin-only routes
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User tidak terautentikasi.'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Hanya admin yang dapat mengakses halaman ini.'
    });
  }

  next();
};

export const checkStatus = (req, res, next) => {
  if (req.user.status !== 'active') {
    return res.status(403).json({
      success: false,
      message: 'Akun Anda belum diaktifkan. Silakan hubungi admin.'
    });
  }
  next();
};
