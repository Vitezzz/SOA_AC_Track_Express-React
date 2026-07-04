export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "No autenticado" });
        }

        if (!roles.includes(req.user.rol_id)) {
            return res.status(403).json({ message: "No tienes permisos para esta acción" });
        }
        next();
    }
}