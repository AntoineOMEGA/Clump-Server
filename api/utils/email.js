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

  await transporter.sendMail(mailOptions)
}

module.exports = sendEmail
