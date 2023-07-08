import jwt from 'jsonwebtoken';

const appSecretKey = process.env.APP_SECRET_KEY;

const auth = (req, res, next) => {
  req.isAnonymous = true;
  req.isAuthenticated = false;

  const authHeader = req.headers.authorization;
  if (!authHeader) return next();
  
  const token = authHeader.split(' ')[1];

  jwt.verify(token, appSecretKey, (err, user) => {
    if (err) return next();
    req.isAnonymous = false;
    req.isAuthenticated = true;
    req.user = user;
    next();
  });
}

export default auth;