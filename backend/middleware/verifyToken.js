import jwt from "jsonwebtoken"

export const verifyToken = (req, res, next) => {
    // Get the token from the request cookies
    const token = req.cookies.access_token;

    // If no token is found, return an unauthorized error
    if (!token) {
        return res.status(401).json("You are not authenticated!");
    }

    // Verify the token using the secret key
    jwt.verify(token, "your-secret-key", (err, user) => {
        if (err) return res.status(403).json("Token is not valid!");

        // If token is valid, proceed to the next middleware or route handler
        req.user = user;

        next();
    })

}