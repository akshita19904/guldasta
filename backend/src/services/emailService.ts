import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendReminderEmail = async (
  toEmail: string,
  toName: string,
  reminderTitle: string,
  daysUntil: number,
  personName: string
) => {
  const mailOptions = {
    from: `"Guldasta 🌿" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Reminder: ${reminderTitle} is in ${daysUntil} days`,
    html: `
    <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #F7F4EF; padding: 0; border-radius: 16px; overflow: hidden;">
      
      <div style="background: linear-gradient(135deg, #2D5A27, #4A7C3F); padding: 32px; text-align: center;">
        <h1 style="font-family: Georgia, serif; color: white; font-size: 28px; margin: 0; font-weight: normal;">
          Gul<em style="color: #D4B978;">dasta</em>
        </h1>
        <p style="color: rgba(255,255,255,0.7); font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin: 6px 0 0;">
          Relationship Assistant
        </p>
      </div>

      <div style="padding: 32px;">
        <p style="font-size: 16px; color: #1C3A18; margin: 0 0 8px;">Hey ${toName}! 👋</p>
        <h2 style="font-family: Georgia, serif; font-size: 22px; color: #1C3A18; margin: 0 0 16px; font-weight: normal;">
          ${reminderTitle} is coming up!
        </h2>
        
        <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #E8E2DA; text-align: center;">
          <div style="font-size: 48px; font-family: Georgia, serif; color: #2D5A27; font-weight: 600; line-height: 1;">${daysUntil}</div>
          <div style="font-size: 14px; color: #7A8A75; margin-top: 4px;">days away</div>
        </div>

        <p style="font-size: 14px; color: #4A5E45; line-height: 1.7; margin-bottom: 24px;">
          Don't forget to make <strong>${personName}</strong> feel special! 
          Guldasta has AI-powered gift ideas and personalised messages ready for you.
        </p>

        <div style="text-align: center; margin-bottom: 28px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/gifts" 
             style="display: inline-block; background: linear-gradient(135deg, #2D5A27, #4A7C3F); color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 14px; font-weight: 500;">
            Find the perfect gift →
          </a>
        </div>

        <div style="display: flex; gap: 10px; justify-content: center;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/messages" 
             style="display: inline-block; background: #EEF4EC; color: #2D5A27; text-decoration: none; padding: 10px 20px; border-radius: 10px; font-size: 13px;">
            Write a message
          </a>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/reminders" 
             style="display: inline-block; background: #EEF4EC; color: #2D5A27; text-decoration: none; padding: 10px 20px; border-radius: 10px; font-size: 13px;">
            View all reminders
          </a>
        </div>
      </div>

      <div style="padding: 20px 32px; border-top: 1px solid #E8E2DA; text-align: center;">
        <p style="font-size: 12px; color: #8A9E85; margin: 0;">
          Sent with love by Guldasta · Your relationship assistant
        </p>
      </div>
    </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

export const sendWelcomeEmail = async (toEmail: string, toName: string) => {
  const mailOptions = {
    from: `"Guldasta 🌿" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Welcome to Guldasta, ${toName}! 🌿`,
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #2D5A27, #4A7C3F); padding: 32px; text-align: center; border-radius: 16px 16px 0 0;">
        <h1 style="font-family: Georgia, serif; color: white; font-size: 28px; margin: 0; font-weight: normal;">
          Gul<em style="color: #D4B978;">dasta</em>
        </h1>
      </div>
      <div style="background: #F7F4EF; padding: 32px; border-radius: 0 0 16px 16px;">
        <h2 style="font-family: Georgia, serif; color: #1C3A18; font-weight: normal;">
          Welcome, ${toName}! 🌿
        </h2>
        <p style="color: #4A5E45; line-height: 1.7;">
          You've joined Guldasta — your personal relationship and celebration assistant. 
          Here's what you can do:
        </p>
        <ul style="color: #4A5E45; line-height: 2;">
          <li>Add your loved ones to <strong>My Circle</strong></li>
          <li>Set <strong>reminders</strong> for birthdays and anniversaries</li>
          <li>Get <strong>AI gift ideas</strong> personalised for them</li>
          <li>Write <strong>heartfelt messages</strong> in seconds</li>
        </ul>
        <div style="text-align: center; margin-top: 24px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" 
             style="display: inline-block; background: linear-gradient(135deg, #2D5A27, #4A7C3F); color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 14px; font-weight: 500;">
            Go to your dashboard →
          </a>
        </div>
      </div>
    </div>
    `
  };

  await transporter.sendMail(mailOptions);
};