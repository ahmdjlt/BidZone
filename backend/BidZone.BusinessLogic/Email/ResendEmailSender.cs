using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace BidZone.BusinessLogic.Email;

public class ResendEmailSender : IEmailSender
{
    private static readonly HttpClient _http = new()
    {
        BaseAddress = new Uri("https://api.resend.com/")
    };

    public async Task SendAsync(string toAddress, string subject, string htmlBody)
    {
        if (!EmailOptionsHolder.HasResend)
            throw new InvalidOperationException("Resend API key is not configured.");

        var fromAddress = string.IsNullOrWhiteSpace(EmailOptionsHolder.FromAddress)
            ? "onboarding@resend.dev"
            : EmailOptionsHolder.FromAddress;
        var from = string.IsNullOrWhiteSpace(EmailOptionsHolder.FromName)
            ? fromAddress
            : $"{EmailOptionsHolder.FromName} <{fromAddress}>";

        using var request = new HttpRequestMessage(HttpMethod.Post, "emails")
        {
            Content = JsonContent.Create(new
            {
                from,
                to = new[] { toAddress },
                subject,
                html = htmlBody
            })
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", EmailOptionsHolder.ResendApiKey);

        using var response = await _http.SendAsync(request);
        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new InvalidOperationException($"Resend API returned {(int)response.StatusCode}: {error}");
        }
    }
}
