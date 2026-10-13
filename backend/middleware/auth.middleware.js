const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const Company = require("../models/Company.model");

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    let user;
    if (decoded.role === "admin") {
      user = await User.findById(decoded.id);
    } else if (decoded.role === "company_hr") {
      user = await Company.findById(decoded.id);
      if (user && !user.role) {
        user.role = "company_hr";
      }
    } else {
      user = await User.findById(decoded.id);
    }
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

const roleCheck = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Not authorized for this role" });
    }
    next();
  };
};

module.exports = { auth, roleCheck };