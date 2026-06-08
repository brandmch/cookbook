import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: { strategy: "database" },
  pages: {
    signIn: "/login",
    verifyRequest: "/login?verify=1",
  },
  providers: [
    EmailProvider({
      from: process.env.RESEND_FROM ?? "noreply@famcookbook.com",
      async sendVerificationRequest({ identifier: email, url, provider }) {
        // Locally: use nodemailer against EMAIL_SERVER_HOST (e.g. Mailpit/MailHog)
        // On Vercel (VERCEL=1): use Resend
        if (!process.env.VERCEL && process.env.EMAIL_SERVER_HOST) {
          const { createTransport } = await import("nodemailer");
          const transport = createTransport({
            host: process.env.EMAIL_SERVER_HOST,
            port: Number(process.env.EMAIL_SERVER_PORT ?? 1025),
            auth: {
              user: process.env.EMAIL_SERVER_USER ?? "",
              pass: process.env.EMAIL_SERVER_PASSWORD ?? "",
            },
          });
          await transport.sendMail({
            to: email,
            from: provider.from,
            subject: `Sign in to Fam Cookbook`,
            text: `Sign in: ${url}`,
            html: `<a href="${url}">Sign in →</a>`,
          });
          return;
        }

        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        const { host } = new URL(url);
        const { error } = await resend.emails.send({
          from: process.env.RESEND_FROM ?? "noreply@famcookbook.com",
          to: email,
          subject: `Sign in to ${host}`,
          html: `
            <body style="margin:0;padding:0;background:#f3ead6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3ead6;padding:40px 16px;">
                <tr><td align="center">
                  <table width="100%" style="max-width:480px;background:#faf4e6;border-radius:12px;box-shadow:0 2px 20px rgba(58,44,32,.12);overflow:hidden;">
                    <tr><td style="background:#bf6243;height:6px;"></td></tr>
                    <tr><td style="padding:36px 40px 28px;">
                      <p style="margin:0 0 8px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#9c8a78;font-family:monospace;">Fam Cookbook</p>
                      <h1 style="margin:0 0 20px;font-size:28px;color:#3a2c20;">Your magic link</h1>
                      <p style="margin:0 0 28px;font-size:15px;color:#5a4a3a;line-height:1.6;">Click the button below to sign in. This link expires in 24 hours and can only be used once.</p>
                      <a href="${url}" style="display:inline-block;background:#bf6243;color:#faf4e6;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:8px;">Sign in →</a>
                      <p style="margin:28px 0 0;font-size:12px;color:#9c8a78;">Or copy this link: <a href="${url}" style="color:#bf6243;">${url}</a></p>
                    </td></tr>
                    <tr><td style="padding:16px 40px;border-top:1px solid #e8dcc8;">
                      <p style="margin:0;font-size:11px;color:#b0a090;">If you didn't request this, you can safely ignore it.</p>
                    </td></tr>
                  </table>
                </td></tr>
              </table>
            </body>
          `,
        });
        if (error) throw new Error(error.message);
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
};
