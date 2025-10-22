import nodemailer from "nodemailer";

// NOTE: For real-world use, replace these placeholders with environment variables 
// (e.g., process.env.EMAIL_USER, process.env.EMAIL_PASS)
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use other services like Outlook, or use a custom SMTP host
    auth: {
        user: "vsal0882@gmail.com", // ⚠️ REPLACE WITH YOUR SENDER EMAIL
        pass: "txxi suhj lvql qgkc" // ⚠️ REPLACE WITH YOUR GMAIL APP PASSWORD
        // IMPORTANT: If using Gmail, you MUST generate an "App Password" 
        // in your Google Account Security settings, not your regular password.
    }
});

/**
 * Sends a verification email to the new user.
 * @param {string} toEmail - The recipient's email address.
 * @param {string} token - The unique verification token.
 */
export const sendVerificationEmail = async (toEmail, token) => {
    // The link should point back to your server's verification route
    const verificationLink = `http://localhost:5000/api/auth/verify?token=${token}`;

    const mailOptions = {
        from: '"VenuBooking" <vsal0882@gmail.com>', // Sender address
        to: toEmail, // List of recipients
        subject: "Verify Your VenuBooking Events Account", // Subject line
        html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <h2 style="color: #FFC300;">Welcome to ApexMotor Events!</h2>
                <p>Thanks for joining. Please click the button below to verify your email address and activate your account.</p>
                
                <a href="${verificationLink}" 
                   style="display: inline-block; padding: 10px 20px; margin: 20px 0; 
                          background-color: #FFC300; color: #000; text-decoration: none; 
                          border-radius: 5px; font-weight: bold;">
                    Verify My Email
                </a>
                
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p><a href="${verificationLink}">${verificationLink}</a></p>
                
                <p style="font-size: 0.8em; color: #888;">This link will expire soon. If you didn't register for this service, you can ignore this email.</p>
                <p style="margin-top: 30px; font-size: 0.9em;">- The ApexMotor Team</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${toEmail}`);
    } catch (error) {
        console.error(`ERROR sending verification email to ${toEmail}:`, error);
        // Important: In a real app, you would log this error and inform the user.
        throw new Error("Failed to send verification email.");
    }
};
