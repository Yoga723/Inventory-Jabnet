// backend/middleware/auth.js
const jwt = require("jsonwebtoken");


// Middleware jang verifikasi JWT jeng set req.user
const authenticateMiddleware = (req, res, next) => {
  const token = req.cookies.auth_token;
  if (!token) {
    console.log("TIDAK ADA TOKEN");
    return res.status(401).json({ error: "Not Authenticated" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    
    next();
  } catch (error) {
    return res.status(401).json({ error: "Tokenna invalid, coba login dei" });
  }
};

// Middleware jang cek authorized role
const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Not Authorized" });

    const roleHierarchy = {
      field: 1,
      operator: 2,
      admin: 3,
      super_admin: 4,
    };

    // Check rolena aya atau hente
    if (!roleHierarchy[req.user.role]) {
      console.log(
        "Rolena eweh ie mah ceng, cek dei di database inventory_system"
      );
      return res.status(403).json({ error: "Invalid user role" });
    }

    const hasAccess = allowedRoles.some(
      (role) => roleHierarchy[req.user.role] >= roleHierarchy[role]
    );

    if (!hasAccess) {
      console.log(`Access denied for ${req.user.role} to ${req.path}`);
      return res.status(403).json({ error: "Access denied ceng" });
    }

    next();
  };
};

module.exports = { authenticateMiddleware, authorize };
