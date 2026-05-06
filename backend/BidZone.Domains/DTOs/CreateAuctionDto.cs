using System.ComponentModel.DataAnnotations;

namespace BidZone.Domains.DTOs;

public class CreateAuctionDto
{
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? ImageUrl { get; set; }
    public List<string>? ImageUrls { get; set; }

    [Required]
    public decimal StartingPrice { get; set; }

    public decimal? ReservePrice { get; set; }

    [Required]
    public DateTime EndTime { get; set; }

    [Required]
    public int CategoryId { get; set; }
}
