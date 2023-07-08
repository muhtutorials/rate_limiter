const loginRequired = (req, res, next) => {
  if (req.isAnonymous) {
    return res.status(403).json({ message: 'You must be logged in to access this route.' });
  }
  next();
}

export default loginRequired;