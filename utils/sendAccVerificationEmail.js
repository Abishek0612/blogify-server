require('dotenv').config()
const nodemailer = require('nodemailer');

//create a function to send email

const sendAccVerificationEmail = async (to, resetToken) => {
    try {
        //create transport
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user : process.env.GMAIL_USER , //your email address
                pass:process.env.GMAIL_PASS
            }
        })

        //create message
        const message ={
            to,
            subject: 'Account Verification ',
            html: `
            <p>You are receiving this email because you have requested to verify
            your account.</p>
                <p>Please click on the following link, or paste this into your 
                browser to complete the process:</p>
                <p>http://localhost:3000/account-verification/${resetToken}</p>
                <p>If you did not request this, please ignore this email.</p> 
            `
        }
        //send the email
      const info =  await transporter.sendMail(message)
      console.log('Email sent' , info.messageId)
    } catch (error) {
        console.log(error)
        throw new Error('Email sending failed')
    }
}

module.exports =sendAccVerificationEmail