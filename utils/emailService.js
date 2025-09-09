const nodemailer = require('nodemailer');
const { enhancedLogger } = require('../middleware/logger');
require('dotenv').config();

// Create email transporter using Gmail
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS // This should be your Gmail App Password
        }
    });
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken, username) => {
    try {
        // Check if email is properly configured
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || 
            process.env.EMAIL_USER === 'your-email@gmail.com' || 
            process.env.EMAIL_PASS === 'your-app-password') {
            
            // Fallback to console logging for development/testing
            console.log('📧 Email not configured, logging reset token to console:');
            console.log('='.repeat(60));
            console.log(`📧 Password Reset for: ${email}`);
            console.log(`👤 Username: ${username}`);
            console.log(`🔑 RESET TOKEN: ${resetToken}`);
            console.log(`� HOW TO USE IN POSTMAN:`);
            console.log(`   1. Method: POST`);
            console.log(`   2. URL: http://localhost:${process.env.PORT || 3000}/api/auth/reset-password`);
            console.log(`   3. Headers: Content-Type: application/json`);
            console.log(`   4. Body (JSON):`);
            console.log(`      {`);
            console.log(`        "resetToken": "${resetToken}",`);
            console.log(`        "newPassword": "your-new-password"`);
            console.log(`      }`);
            console.log(`⏰ Token expires in 1 hour`);
            console.log('='.repeat(60));
            return true;
        }

        const transporter = createTransporter();
        
        const resetLink = `http://localhost:${process.env.PORT || 3000}/api/auth/reset-password?token=${resetToken}`;
        
        const mailOptions = {
            from: `"TaskManagement Support" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: 'Password Reset Request - Task Management API',
            html: `
                <h2>Password Reset Request</h2>
                <p>Hello ${username},</p>
                <p>You requested a password reset for your Task Management account.</p>
                <p><strong>Your Reset Token:</strong></p>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 14px; margin: 20px 0;">
                    ${resetToken}
                </div>
                <p><strong>How to use this token in Postman:</strong></p>
                <ol>
                    <li>Method: <strong>POST</strong></li>
                    <li>URL: <strong>http://localhost:${process.env.PORT || 3000}/api/auth/reset-password</strong></li>
                    <li>Headers: <strong>Content-Type: application/json</strong></li>
                    <li>Body (JSON):</li>
                </ol>
                <div style="background-color: #f0f0f0; padding: 10px; border-radius: 5px; font-family: monospace; font-size: 12px; margin: 10px 0;">
{<br>
&nbsp;&nbsp;"resetToken": "${resetToken}",<br>
&nbsp;&nbsp;"newPassword": "your-new-password"<br>
}
                </div>
                <p><strong>This token will expire in 1 hour.</strong></p>
                <p>If you didn't request this password reset, please ignore this email.</p>
                <br>
                <p>Best regards,<br>Task Management API Team</p>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        enhancedLogger.email.sent('password_reset', email, result.messageId);
        return true;
    } catch (error) {
        enhancedLogger.email.failed('password_reset', email, error);
        
        // Fallback to console logging if email fails
        console.log('📧 Email failed, logging reset token to console as fallback:');
        console.log('='.repeat(60));
        console.log(`📧 Password Reset for: ${email}`);
        console.log(`👤 Username: ${username}`);
        console.log(`🔑 RESET TOKEN: ${resetToken}`);
        console.log(`� HOW TO USE IN POSTMAN:`);
        console.log(`   1. Method: POST`);
        console.log(`   2. URL: http://localhost:${process.env.PORT || 3000}/api/auth/reset-password`);
        console.log(`   3. Headers: Content-Type: application/json`);
        console.log(`   4. Body (JSON):`);
        console.log(`      {`);
        console.log(`        "resetToken": "${resetToken}",`);
        console.log(`        "newPassword": "your-new-password"`);
        console.log(`      }`);
        console.log(`⏰ Token expires in 1 hour`);
        console.log('='.repeat(60));
        return true; // Return true so the API doesn't fail
    }
};

// Send welcome email (optional)
const sendWelcomeEmail = async (email, username) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: `"TaskManagement Support" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: 'Welcome to Task Management API!',
            html: `
                <h2>Welcome to Task Management API!</h2>
                <p>Hello ${username},</p>
                <p>Your account has been created successfully!</p>
                <p>You can now start managing your tasks using our API.</p>
                <p>Login at: <a href="http://localhost:${process.env.PORT || 3000}/api/auth/login">http://localhost:${process.env.PORT || 3000}/api/auth/login</a></p>
                <br>
                <p>Happy task managing!<br>Task Management API Team</p>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Welcome email sent successfully:', result.messageId);
        return true;
    } catch (error) {
        console.error('❌ Error sending welcome email:', error.message);
        return false;
    }
};

// Send email verification for new registrations
const sendVerificationEmail = async (email, verificationToken, username) => {
    try {
        // Check if email is properly configured
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || 
            process.env.EMAIL_USER === 'your-email@gmail.com' || 
            process.env.EMAIL_PASS === 'your-app-password') {
            
            // Fallback to console logging for development/testing
            console.log('📧 Email not configured, logging verification token to console:');
            console.log('='.repeat(60));
            console.log(`📧 Email Verification for: ${email}`);
            console.log(`👤 Username: ${username}`);
            console.log(`🔑 VERIFICATION TOKEN: ${verificationToken}`);
            console.log(`📋 HOW TO VERIFY IN POSTMAN:`);
            console.log(`   1. Method: POST`);
            console.log(`   2. URL: http://localhost:${process.env.PORT || 3000}/api/auth/verify-email`);
            console.log(`   3. Headers: Content-Type: application/json`);
            console.log(`   4. Body (JSON):`);
            console.log(`      {`);
            console.log(`        "token": "${verificationToken}"`);
            console.log(`      }`);
            console.log(`⏰ Token expires in 24 hours`);
            console.log('='.repeat(60));
            return true;
        }

        const transporter = createTransporter();
        
        const mailOptions = {
            from: `"TaskManagement Support" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: 'Email Verification - Task Management API',
            html: `
                <h2>Welcome to Task Management API!</h2>
                <p>Hello ${username},</p>
                <p>Thank you for registering! Please verify your email address to activate your account.</p>
                <p><strong>Your Verification Token:</strong></p>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 14px; margin: 20px 0;">
                    ${verificationToken}
                </div>
                <p><strong>How to verify in Postman:</strong></p>
                <ol>
                    <li>Method: <strong>POST</strong></li>
                    <li>URL: <strong>http://localhost:${process.env.PORT || 3000}/api/auth/verify-email</strong></li>
                    <li>Headers: <strong>Content-Type: application/json</strong></li>
                    <li>Body (JSON):</li>
                </ol>
                <div style="background-color: #f0f0f0; padding: 10px; border-radius: 5px; font-family: monospace; font-size: 12px; margin: 10px 0;">
{<br>
&nbsp;&nbsp;"token": "${verificationToken}"<br>
}
                </div>
                <p><strong>This token will expire in 24 hours.</strong></p>
                <p>Once verified, you can log in and start managing your tasks!</p>
                <p>If you didn't create this account, please ignore this email.</p>
                <br>
                <p>Best regards,<br>Task Management API Team</p>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        enhancedLogger.email.sent('email_verification', email, result.messageId);
        return true;
    } catch (error) {
        enhancedLogger.email.failed('email_verification', email, error);
        
        // Fallback to console logging if email fails
        console.log('📧 Email failed, logging verification token to console as fallback:');
        console.log('='.repeat(60));
        console.log(`📧 Email Verification for: ${email}`);
        console.log(`👤 Username: ${username}`);
        console.log(`🔑 VERIFICATION TOKEN: ${verificationToken}`);
        console.log(`📋 HOW TO VERIFY IN POSTMAN:`);
        console.log(`   1. Method: POST`);
        console.log(`   2. URL: http://localhost:${process.env.PORT || 3000}/api/auth/verify-email`);
        console.log(`   3. Headers: Content-Type: application/json`);
        console.log(`   4. Body (JSON):`);
        console.log(`      {`);
        console.log(`        "token": "${verificationToken}"`);
        console.log(`      }`);
        console.log(`⏰ Token expires in 24 hours`);
        console.log('='.repeat(60));
        return true; // Return true so the API doesn't fail
    }
};

module.exports = {
    sendPasswordResetEmail,
    sendWelcomeEmail,
    sendVerificationEmail
};
