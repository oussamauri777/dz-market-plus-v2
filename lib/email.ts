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
