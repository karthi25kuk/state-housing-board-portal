const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {

    console.log("========== ROLE CHECK ==========");
    console.log("req.user:", req.user);
    console.log("User role:", req.user?.role);
    console.log("Allowed roles:", allowedRoles);
    console.log("================================");

    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to access this resource.",
        receivedRole: req.user.role,
        allowedRoles: allowedRoles,
      });
    }

    next();
  };
};

module.exports = allowRoles;