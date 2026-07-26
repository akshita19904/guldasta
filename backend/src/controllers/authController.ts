import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { sendWelcomeEmail } from '../services/emailService';

const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || '', {
    expiresIn: '7d'
  });
};

const checkIsAdmin = (email: string): boolean => {
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  return adminEmails.includes(email.trim().toLowerCase());
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ 
        success: false, 
        message: 'Please provide name, email and password' 
      });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
      return;
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id.toString());

    
  sendWelcomeEmail(user.email, user.name).catch(err =>
    console.log('Welcome email failed:', err.message)
  );

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      },
      isAdmin: checkIsAdmin(user.email)
    });

  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error' 
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
      return;
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
      return;
    }

    const token = generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      },
      isAdmin: checkIsAdmin(user.email)
    });

  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error' 
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      user
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, avatar, notificationsEnabled } = req.body;

    const updates: any = {};
    if (name !== undefined) {
      if (name.trim().length < 2) {
        res.status(400).json({ success: false, message: 'Name must be at least 2 characters' });
        return;
      }
      updates.name = name.trim();
    }
    if (avatar !== undefined) updates.avatar = avatar;
    if (notificationsEnabled !== undefined) updates.notificationsEnabled = notificationsEnabled;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Please provide current and new password' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
      return;
    }

    if (currentPassword === newPassword) {
      res.status(400).json({ success: false, message: 'New password must be different from current password' });
      return;
    }

    // Fetch user with password field (select: false by default)
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Current password is incorrect' });
      return;
    }

    user.password = newPassword;
    await user.save(); // triggers bcrypt pre-save hook

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};