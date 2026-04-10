namespace BidZone.Domains.Responses;

public class ActionResponse
{
    public bool IsSuccess { get; set; }
    public string Message { get; set; } = string.Empty;

    public static ActionResponse Success(string message) => new()
    {
        IsSuccess = true,
        Message = message
    };

    public static ActionResponse Failure(string message) => new()
    {
        IsSuccess = false,
        Message = message
    };
}
