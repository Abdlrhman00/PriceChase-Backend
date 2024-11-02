function isAdmin(req, res, next) {
    console.log('authMiddleware')
    next();
    // if (req.user && req.user.role === 'admin') {
    //     next();  // Allow access
    // } else {
    //     res.status(403).json({ message: 'Admin access only.' });
    // }
}
