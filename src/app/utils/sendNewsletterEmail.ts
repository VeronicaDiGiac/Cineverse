import nodemailer from 'nodemailer'

export async function sendNewsletterEmail(email: string, subject: string, content: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  await transporter.sendMail({
    from: '"CineVerse" <noreply@cineverse.it>',
    to: email,
    subject,
    html: content,
  })
}
