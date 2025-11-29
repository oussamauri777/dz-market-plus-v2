import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const emailFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev';

export async function sendVerificationEmail(to: string, code: string) {
    if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY is not configured');
    }

    try {
        const { data, error } = await resend.emails.send({
            from: emailFrom,
            to: [to],
            subject: 'Votre code de vérification DZ Market+',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .container {
                            background: #ffffff;
                            border-radius: 8px;
                            padding: 40px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        }
                        .logo {
                            text-align: center;
                            margin-bottom: 30px;
                        }
                        .logo h1 {
                            color: #F59E0B;
                            margin: 0;
                            font-size: 32px;
                        }
                        .code-container {
                            background: #F3F4F6;
                            border-radius: 8px;
                            padding: 30px;
                            text-align: center;
                            margin: 30px 0;
                        }
                        .code {
                            font-size: 36px;
                            font-weight: bold;
                            letter-spacing: 8px;
                            color: #F59E0B;
                            margin: 10px 0;
                        }
                        .footer {
                            text-align: center;
                            color: #6B7280;
                            font-size: 14px;
                            margin-top: 30px;
                            padding-top: 20px;
                            border-top: 1px solid #E5E7EB;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="logo">
                            <h1>DZ Market+</h1>
                        </div>
                        <h2>Vérification de votre email</h2>
                        <p>Bonjour,</p>
                        <p>Merci de vous être inscrit sur DZ Market+. Pour finaliser votre inscription, veuillez entrer le code de vérification ci-dessous :</p>
                        
                        <div class="code-container">
                            <div style="color: #6B7280; font-size: 14px; margin-bottom: 10px;">Votre code de vérification</div>
                            <div class="code">${code}</div>
                            <div style="color: #6B7280; font-size: 12px; margin-top: 10px;">Ce code expire dans 10 minutes</div>
                        </div>
                        
                        <p>Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email en toute sécurité.</p>
                        
                        <div class="footer">
                            <p>DZ Market+ - Votre marketplace algérienne de confiance</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });

        if (error) {
            throw new Error(error.message);
        }

        console.log(`[EMAIL] Verification code sent to ${to}. Email ID: ${data?.id}`);
        return data;
    } catch (error: any) {
        console.error('[EMAIL] Failed to send verification email:', error.message);
        throw new Error(`Failed to send email: ${error.message}`);
    }
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
    if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY is not configured');
    }

    try {
        const { data, error } = await resend.emails.send({
            from: emailFrom,
            to: [to],
            subject: 'Réinitialisation de votre mot de passe - DZ Market+',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .container {
                            background: #ffffff;
                            border-radius: 8px;
                            padding: 40px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        }
                        .logo {
                            text-align: center;
                            margin-bottom: 30px;
                        }
                        .logo h1 {
                            color: #F59E0B;
                            margin: 0;
                            font-size: 32px;
                        }
                        .button-container {
                            text-align: center;
                            margin: 30px 0;
                        }
                        .button {
                            background-color: #F59E0B;
                            color: #ffffff !important;
                            padding: 12px 24px;
                            border-radius: 6px;
                            text-decoration: none;
                            font-weight: bold;
                            display: inline-block;
                        }
                        .footer {
                            text-align: center;
                            color: #6B7280;
                            font-size: 14px;
                            margin-top: 30px;
                            padding-top: 20px;
                            border-top: 1px solid #E5E7EB;
                        }
                        .link-text {
                            color: #6B7280;
                            font-size: 12px;
                            word-break: break-all;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="logo">
                            <h1>DZ Market+</h1>
                        </div>
                        <h2>Réinitialisation de mot de passe</h2>
                        <p>Bonjour,</p>
                        <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte DZ Market+.</p>
                        <p>Pour choisir un nouveau mot de passe, cliquez sur le bouton ci-dessous :</p>
                        
                        <div class="button-container">
                            <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
                        </div>
                        
                        <p>Ce lien est valide pendant 1 heure.</p>
                        <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.</p>
                        
                        <div class="footer">
                            <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
                            <p class="link-text">${resetUrl}</p>
                            <p>DZ Market+ - Votre marketplace algérienne de confiance</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });

        if (error) {
            throw new Error(error.message);
        }

        console.log(`[EMAIL] Password reset email sent to ${to}. Email ID: ${data?.id}`);
        return data;
    } catch (error: any) {
        console.error('[EMAIL] Failed to send password reset email:', error.message);
        throw new Error(`Failed to send email: ${error.message}`);
    }
}
