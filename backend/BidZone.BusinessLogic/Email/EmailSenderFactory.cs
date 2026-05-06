namespace BidZone.BusinessLogic.Email;

public static class EmailSenderFactory
{
    public static IEmailSender Create()
    {
        if (EmailOptionsHolder.HasResend)
            return new ResendEmailSender();
        return new SmtpEmailSender();
    }
}
