import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  const userEmail = (req.user.email || '').trim().toLowerCase();

  console.log('DEBUG — req.user:', req.user);
  console.log('DEBUG — userEmail:', userEmail);
  console.log('DEBUG — adminEmails:', adminEmails);

  if (!adminEmails.includes(userEmail)) {
    res.status(403).json({ success: false, message: 'Admin access only' });
    return;
  }
  next();
};