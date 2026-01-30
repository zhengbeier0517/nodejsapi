/**
 * Authorization Middleware
 * Handles role-based access control
 * Requires authenticate middleware to run first (sets req.user)
 */

/**
 * Middleware to check if user has required role(s)
 * @param {...string} allowedRoles - Role names that are allowed (e.g., 'admin', 'teacher')
 * @returns {Function} Express middleware function
 *
 * @example
 * // Single role
 * router.post('/courses', authenticate, requireRole('admin'), courseController.create);
 *
 * @example
 * // Multiple roles (OR logic - user needs ANY of these roles)
 * router.get('/dashboard', authenticate, requireRole('admin', 'teacher'), dashboardController.view);
 */
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        // Ensure user is authenticated (should be set by authenticate middleware)
        if (!req.user || !req.user.roles) {
            return res.sendCommonValue(401, 'Authentication required');
        }

        // Check if user has any of the allowed roles
        const userRoles = req.user.roles.map(role => role.toLowerCase());
        const hasPermission = allowedRoles.some(role =>
            userRoles.includes(role.toLowerCase())
        );

        if (!hasPermission) {
            const rolesList = allowedRoles.join(', ');
            return res.sendCommonValue(
                403,
                `Access denied. Required role: ${rolesList}`
            );
        }

        next();
    };
};

/**
 * Shorthand middleware for admin-only access
 * @example
 * router.delete('/courses/:id', authenticate, requireAdmin, courseController.remove);
 */
const requireAdmin = requireRole('admin', 'super admin');

/**
 * Shorthand middleware for teacher or admin access
 * @example
 * router.post('/courses/:id/content', authenticate, requireTeacherOrAdmin, contentController.create);
 */
const requireTeacherOrAdmin = requireRole('admin', 'super admin', 'teacher');

module.exports = {
    requireRole,
    requireAdmin,
    requireTeacherOrAdmin
};
