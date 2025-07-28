import nodemailer from 'nodemailer'

export async function sendConfirmationEmail(email: string) {
  const confirmUrl = `https://tuo-dominio.it/api/newsletter/confirm?email=${encodeURIComponent(email)}`

  const transporter = nodemailer.createTransport({
    service: 'gmail', // o smtp, mailtrap, etc.
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  await transporter.sendMail({
    from: '"Il Tuo Sito" <noreply@iltuosito.it>',
    to: email,
    subject: 'Conferma iscrizione alla newsletter',
    html: `
      <p>Ciao! Grazie per esserti iscritto alla nostra newsletter.</p>
      <p>Conferma la tua iscrizione cliccando qui:</p>
      <a href="${confirmUrl}">Conferma iscrizione</a>
    `,
  })
}

// 🔐 Configura le variabili SMTP_USER e SMTP_PASS nel tuo .env.
