using BidZone.Domains.DTOs;

namespace BidZone.Domains.Responses;

public class AuthResultDto
{
    public bool Succeeded { get; set; }
    public AuthResponseDto? Response { get; set; }
    public string? RefreshToken { get; set; }
    public IReadOnlyCollection<string> Errors { get; set; } = Array.Empty<string>();

    public static AuthResultDto Success(AuthResponseDto response, string refreshToken) => new()
    {
        Succeeded = true,
        Response = response,
        RefreshToken = refreshToken
    };

    public static AuthResultDto Failure(params string[] errors) => new()
    {
        Succeeded = false,
        Errors = errors.Where(error => !string.IsNullOrWhiteSpace(error)).ToArray()
    };
}
