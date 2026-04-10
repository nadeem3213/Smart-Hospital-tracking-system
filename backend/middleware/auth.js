const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}

function authenticateAdmin(req, res, next) {
  authenticateToken(req, res, () => {
    if (req.user && req.user.role === "admin") {
      return next();
    }
    return res.status(403).json({ message: "Admin access required" });
  });
}

module.exports = { authenticateToken, authenticateAdmin };
