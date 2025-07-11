// backend/middleware/auth.js
const jwt = require("jsonwebtoken");

// Middleware jang verifikasi JWT jeng set req.user
const authenticateMiddleware = (req, res, next) => {
//   console.log(`[AUTH MIDDLEWARE] Path: ${req.originalUrl}`);
//   console.log("[AUTH MIDDLEWARE] All Request Cookies:", req.cookies);
  
//   const token = req.cookies.auth_token;
//   res.status(401).json({message:`this is req : ${req.cookies.auth_token} and this is token ${token}`})
  
//   if (!token) return res.status(401).json({ error: "Not Authenticated" });
  

  try {
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // req.user = decoded.user;
    // console.log(`[AUTH MIDDLEWARE] SUCCESS: User ${req.user.username} authenticated.`);

    next();
  } catch (error) {
    return res.status(401).json({ error: "Tokenna invalid, coba login dei" });
  }
};

const isAdminOrSuperAdmin = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === "admin" || req.user.role === "super_admin")
  ) {
    next();
  } else {
    res.status(403).json({ message: "Forbidden: Access is denied." });
  }
};

// Middleware jang cek authorized role
const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    // if (!req.user) return res.status(401).json({ error: "Not Authorized" });

    // const roleHierarchy = {
    //   field: 1,
    //   operator: 2,
    //   admin: 3,
    //   super_admin: 4,
    // };

    // // Check rolena aya atau hente
    // if (!roleHierarchy[req.user.role]) {
    //   console.log(
    //     "Rolena eweh ie mah ceng, cek dei di database inventory_system"
    //   );
    //   return res.status(403).json({ error: "Invalid user role" });
    // }

    // const hasAccess = allowedRoles.some(
    //   (role) => roleHierarchy[req.user.role] >= roleHierarchy[role]
    // );

    // if (!hasAccess) {
    //   console.log(`Access denied for ${req.user.role} to ${req.path}`);
    //   return res.status(403).json({ error: "Access denied ceng" });
    // }

    next();
  };
};

module.exports = { isAdminOrSuperAdmin, authenticateMiddleware, authorize };
