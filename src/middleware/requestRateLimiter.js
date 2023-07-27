import cache from '../cache.js';

const requestRateLimiter = (config = {}) => {
  return async (req, res, next) => {
    const requestRoute = req.path;

    const routeType = config.routes[requestRoute].type;
    const routeWeight = config.routes[requestRoute].weight;
    const rate = config.rates[routeType];
    
    let user;
    if (routeType === 'public') {
      user = req.ip;
    } else {
      user = req.user?.username;
      if (!user) return next();
    }

    const [_, requestsLeft] = await Promise.all([
      cache.set(user, rate, { EX: 3600, NX: true }),
      cache.decrBy(user, routeWeight)      
    ]);
  
    if (requestsLeft < 0) {
      const retryAfter = await cache.ttl(user);
      res.set('Retry-After', retryAfter);
      const requestsPerHour = Math.round(rate / routeWeight);
      const minutesLeft = Math.floor(retryAfter / 60);
      const secondsLeft = retryAfter % 60;
      return res.status(429).json({ message: `You are allowed to make ${requestsPerHour} requests per hour. You have exceeded your limit. Try again in ${minutesLeft} minutes and ${secondsLeft} seconds.` });
    }
    next();
  }
}

export default requestRateLimiter;