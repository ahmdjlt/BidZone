namespace BidZone.BusinessLogic.Email;

public interface IEmailSender
{
    Task SendAsync(string toAddress, string subject, string htmlBody);
}
