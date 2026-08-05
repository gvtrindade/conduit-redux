import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendResetPasswordEmail(params: {
  to: string
  url: string
}) {
  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="background: #2563eb; padding: 24px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px;">Redefinir Senha</h1>
      </div>
      <div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="margin: 0 0 16px;">Recebemos uma solicitação de redefinição de senha para sua conta.</p>
        <p style="margin: 0 0 24px;">Clique no botão abaixo para criar uma nova senha:</p>
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${params.url}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
            Redefinir senha
          </a>
        </div>
        <p style="margin: 0 0 8px; font-size: 14px; color: #64748b;">
          Se você não solicitou esta redefinição, ignore este e-mail.
        </p>
        <p style="margin: 0; font-size: 14px; color: #64748b;">
          Este link expira em 1 hora.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="margin: 0; font-size: 12px; color: #94a3b8;">
          Se o botão acima não funcionar, copie e cole este link no seu navegador:<br />
          <a href="${params.url}" style="color: #2563eb;">${params.url}</a>
        </p>
      </div>
    </div>
  `

  await resend.emails.send({
    from: process.env.RESEND_SENDER as string,
    to: params.to,
    subject: "Redefinir sua senha",
    html,
  })
}

export async function sendVerificationEmail(params: {
  to: string
  url: string
}) {
  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="background: #2563eb; padding: 24px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px;">Verifique seu e-mail</h1>
      </div>
      <div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="margin: 0 0 16px;">Obrigado por criar sua conta!</p>
        <p style="margin: 0 0 24px;">Clique no botão abaixo para verificar seu e-mail e ativar sua conta:</p>
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${params.url}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
            Verificar e-mail
          </a>
        </div>
        <p style="margin: 0 0 8px; font-size: 14px; color: #64748b;">
          Se você não criou uma conta, ignore este e-mail.
        </p>
        <p style="margin: 0; font-size: 14px; color: #64748b;">
          Este link expira em 1 hora.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="margin: 0; font-size: 12px; color: #94a3b8;">
          Se o botão acima não funcionar, copie e cole este link no seu navegador:<br />
          <a href="${params.url}" style="color: #2563eb;">${params.url}</a>
        </p>
      </div>
    </div>
  `

  await resend.emails.send({
    from: process.env.RESEND_SENDER as string,
    to: params.to,
    subject: "Verifique seu e-mail",
    html,
  })
}
