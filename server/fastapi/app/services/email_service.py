from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib
import secrets
from dotenv import load_dotenv
import os

class EmailService:
    def __init__(self):
        load_dotenv() 
        # self.sender_email = 'pgechat.skema@gmail.com'
        self.sender_email = 'ranpge.skema@gmail.com'
        self.mdp = os.getenv('MDP_EMAIL')

    def send_verification_email(self, email: str, verification_code: str, user_name: str) -> dict:
        receiver_email = email
        subject = 'Email Verification - SKEMA Business School'
        # Création du message Multipart
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = self.sender_email
        message["To"] = receiver_email

        # Corps du message en format HTML avec styles CSS intégrés et logo de l'entreprise
        html = f"""
        <html>
        <head>
            <style>
            body {{
                font-family: Arial, sans-serif;
                background-color: #f7f7f7;
                margin: 0;
                padding: 20px;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }}
            img {{
                max-width: 100%;
                height: auto;
            }}
            h1 {{
                color: #333333;
                font-size: 24px;
            }}
            p {{
                font-size: 16px;
                color: #555555;
                margin-bottom: 15px;
            }}
            .code {{
                font-weight: bold;
                font-size: 20px;
                color: #0066cc;
            }}
            .footer-text {{
                font-style: italic;
                color: #999999;
                margin-top: 20px;
            }}
            </style>
        </head>
        <body>
            <div class="container">
            <img src="lien_vers_votre_logo" alt="Skema Logo">
            <h1>Hello {user_name},</h1>
            <p>Your administrator has requested you to verify your email address.</p>
            <p class="code">{verification_code}</p>
            <p>This code will expire in 7 days.</p>
            <p class="footer-text">Regards,<br />SKEMA Business School Team</p>
            </div>
        </body>
        </html>
        """

        html_part = MIMEText(html, "html")
        message.attach(html_part)

        try:
            smtp_server = smtplib.SMTP('smtp.gmail.com', 587)
            smtp_server.starttls()
            smtp_server.login(self.sender_email, self.mdp)
            smtp_server.sendmail(self.sender_email, receiver_email, message.as_string())
            smtp_server.quit()
            print('E-mail envoyé avec succès!')
            return {"message": "E-mail envoyé avec succès!"}
        except Exception as e:
            print(f'Erreur lors de l\'envoi de l\'e-mail : {str(e)}')
            return {"error": f'Erreur lors de l\'envoi de l\'e-mail : {str(e)}'}

    def send_contact_email(self, email: str, name: str, subject: str, content: str) -> dict:
        # Création du message Multipart
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = email
        message["To"] = self.sender_email

        # Corps du message en format HTML avec styles CSS intégrés et logo de l'entreprise
        html = f"""
        <html>
        <head>
            <style>
            body {{
                font-family: Arial, sans-serif;
                background-color: #f7f7f7;
                margin: 0;
                padding: 20px;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }}
            img {{
                max-width: 100%;
                height: auto;
            }}
            h1 {{
                color: #333333;
                font-size: 24px;
            }}
            p {{
                font-size: 16px;
                color: #555555;
                margin-bottom: 15px;
            }}
            .code {{
                font-weight: bold;
                font-size: 20px;
                color: #0066cc;
            }}
            .footer-text {{
                font-style: italic;
                color: #999999;
                margin-top: 20px;
            }}
            </style>
        </head>
        <body>
        <div class="container">
            <img src="lien_vers_votre_logo" alt="Your Company Logo">
            <h1>Contact the Administrator</h1>
            <p>Dear Admin,</p>
            <p>You have received a new message from {name}. Below is the content of their message:</p>
            <p><strong>Message:</strong><br>{content}</p>
            <p>Please respond to this inquiry at your earliest convenience. The user can be reached at <a href="mailto:{email}">{email}</a>.</p>
            <p class="footer-text">This is an automated email notification. Please do not reply directly to this email.</p>
            </div>
        </body>
        </html>
        """

        html_part = MIMEText(html, "html")
        message.attach(html_part)

        try:
            smtp_server = smtplib.SMTP('smtp.gmail.com', 587)
            smtp_server.starttls()
            smtp_server.login(self.sender_email, self.mdp)
            smtp_server.sendmail(from_addr=email, to_addrs=self.sender_email, msg=message.as_string())
            smtp_server.quit()
            print('E-mail envoyé avec succès!')
            return {"message": "E-mail envoyé avec succès!"}
        except Exception as e:
            print(f'Erreur lors de l\'envoi de l\'e-mail : {str(e)}')
            return {"error": f'Erreur lors de l\'envoi de l\'e-mail : {str(e)}'}

    @staticmethod
    def generate_verification_code(length: int = 6) -> str:
        """Génère un code de vérification aléatoire de longueur spécifiée."""
        return ''.join(secrets.choice('0123456789') for _ in range(length))