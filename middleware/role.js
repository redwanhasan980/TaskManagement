// Middleware to check if user has required role
const requireRole = (roles) => {
    return (req, res, next) => {
        try {
            // Check if user is authenticated
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            // Convert single role to array for consistency
            const allowedRoles = Array.isArray(roles) ? roles : [roles];

            // Check if user has required role
            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Required role(s): ${allowedRoles.join(', ')}`
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Role verification failed',
                error: error.message
            });
        }
    };
};

// Middleware to check if user is admin
const requireAdmin = requireRole('admin');

// Middleware to check if user is regular user or admin
const requireUser = requireRole(['user', 'admin']);

// Middleware to check resource ownership or admin role
const requireOwnershipOrAdmin = (getUserIdFromRequest) => {
    return (req, res, next) => {
        try {
            // Admin can access everything
            if (req.user.role === 'admin') {
                return next();
            }

            // Get the user ID that owns the resource
            const resourceUserId = getUserIdFromRequest(req);
            
            // Check if current user owns the resource
            if (req.user.id !== resourceUserId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. You can only access your own resources.'
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Ownership verification failed',
                error: error.message
            });
        }
    };
};

module.exports = {
    requireRole,
    requireAdmin,
    requireUser,
    requireOwnershipOrAdmin
};