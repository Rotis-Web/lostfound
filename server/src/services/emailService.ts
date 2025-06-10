import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { config } from "../config/app.config";

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: parseInt(config.SMTP_PORT, 10),
      secure: false,
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
      },
    } as SMTPTransport.Options);
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: `${config.FROM_NAME} <${config.FROM_EMAIL}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent to ${options.to}`);
    } catch (error) {
      console.error("Email sending failed:", error);
      throw new Error("Failed to send email");
    }
  }

  async sendVerificationEmail(
    email: string,
    name: string,
    token: string
  ): Promise<void> {
    const verificationUrl = `${config.FRONTEND_URL}/verify-email?token=${token}`;

    const html = `
       <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .title{font-weight:700;color:#ffd700;}
            .span{color:#2c3e60; }
            .buttoncontainer{width:100%;display:flex;justify-content:center;}
            .button { 
              display: inline-block; 
              background-color: #ffd700; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 20px 0;
            }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="title">Lost <span class="span"}>&</span>  Found</h1>
            </div>
            <div class="content">
              <h2>Bună ${name}!</h2>
              <p>Mulțumim că te-ai înregistrat pe Lost & Found. Pentru a-ți activa contul, te rugăm să-ți verifici adresa de email.</p>
              <p>Apasă pe butonul de mai jos pentru a-ți verifica email-ul:</p>
              <div class="buttoncontainer">
                 <a href="${verificationUrl}" class="button">Verifică Email-ul</a>
              </div>
              <p>Sau copiază și lipește următorul link în browser:</p>
              <p style="word-break: break-all; color: #007bff;">${verificationUrl}</p>
              <p><strong>Acest link va expira în 24 de ore.</strong></p>
              <p>Dacă nu te-ai înregistrat pe Lost & Found, poți ignora acest email.</p>
            </div>
            <div class="footer">
              <p>© 2025 Lost & Found. Toate drepturile rezervate.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      Bună ${name}!
      
      Mulțumim că te-ai înregistrat pe Lost & Found. Pentru a-ți activa contul, te rugăm să-ți verifici adresa de email.
      
      Accesează următorul link pentru a-ți verifica email-ul:
      ${verificationUrl}
      
      Acest link va expira în 24 de ore.
      
      Dacă nu te-ai înregistrat pe Lost & Found, poți ignora acest email.
    `;

    await this.sendEmail({
      to: email,
      subject: "Verifică-ți adresa de email - Lost & Found",
      text,
      html,
    });
  }

  async sendPasswordResetEmail(
    email: string,
    name: string,
    token: string
  ): Promise<void> {
    const resetUrl = `${config.FRONTEND_URL}/reset-password?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .button { 
              display: inline-block; 
              background-color: #dc3545; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 20px 0;
            }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Lost & Found</h1>
            </div>
            <div class="content">
              <h2>Resetare parolă</h2>
              <p>Bună ${name},</p>
              <p>Am primit o cerere pentru resetarea parolei contului tău Lost & Found.</p>
              <p>Apasă pe butonul de mai jos pentru a-ți reseta parola:</p>
              <a href="${resetUrl}" class="button">Resetează Parola</a>
              <p>Sau copiază și lipește următorul link în browser:</p>
              <p style="word-break: break-all; color: #dc3545;">${resetUrl}</p>
              <p><strong>Acest link va expira în 10 minute.</strong></p>
              <p>Dacă nu ai cerut resetarea parolei, poți ignora acest email. Parola ta va rămâne neschimbată.</p>
            </div>
            <div class="footer">
              <p>© 2025 Lost & Found. Toate drepturile rezervate.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      Resetare parolă - Lost & Found
      
      Bună ${name},
      
      Am primit o cerere pentru resetarea parolei contului tău Lost & Found.
      
      Accesează următorul link pentru a-ți reseta parola:
      ${resetUrl}
      
      Acest link va expira în 10 minute.
      
      Dacă nu ai cerut resetarea parolei, poți ignora acest email.
    `;

    await this.sendEmail({
      to: email,
      subject: "Resetare parolă - Lost & Found",
      text,
      html,
    });
  }
}

export default new EmailService();
