const nodemailer = require('nodemailer')
const nodemailerSendgrid = require('nodemailer-sendgrid')

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport(
    nodemailerSendgrid({
      apiKey: process.env.SENDGRID_API_KEY,
    })
  )

  const mailOptions = {
    from: 'Clump App <noreply@clump.app>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error('Error sending email:', error)
    throw new Error('Email could not be sent')
  }
}

module.exports = sendEmail
