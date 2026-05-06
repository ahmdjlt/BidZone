using System.Net;
using System.Net.Mail;

namespace BidZone.BusinessLogic.Email;

public class SmtpEmailSender : IEmailSender
{
    public async Task SendAsync(string toAddress, string subject, string htmlBody)
    {
        if (!EmailOptionsHolder.IsConfigured)
        {
            // Dev fallback: write the email to the console so the link can still be used.
            Console.WriteLine("─── EMAIL (SMTP not configured) ───");
            Console.WriteLine($"To:      {toAddress}");
            Console.WriteLine($"Subject: {subject}");
            Console.WriteLine(htmlBody);
            Console.WriteLine("───────────────────────────────────");
            return;
        }

        var fromAddress = string.IsNullOrWhiteSpace(EmailOptionsHolder.FromAddress)
            ? EmailOptionsHolder.Username
            : EmailOptionsHolder.FromAddress;

        using var client = new SmtpClient(EmailOptionsHolder.SmtpHost, EmailOptionsHolder.SmtpPort)
        {
            Credentials = new NetworkCredential(EmailOptionsHolder.Username, EmailOptionsHolder.Password),
            EnableSsl = true
        };

        using var message = new MailMessage
        {
            From = new MailAddress(fromAddress, EmailOptionsHolder.FromName),
            Subject = subject,
            Body = htmlBody,
            IsBodyHtml = true
        };
        message.To.Add(new MailAddress(toAddress));

        await client.SendMailAsync(message);
    }
}
