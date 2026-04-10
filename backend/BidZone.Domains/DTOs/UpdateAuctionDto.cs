using System.ComponentModel.DataAnnotations;

namespace BidZone.Domains.DTOs;

public class UpdateAuctionDto
{
    [MaxLength(200)]
    public string? Title { get; set; }

    public string? Description { get; set; }

    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    public decimal? ReservePrice { get; set; }

    public DateTime? EndTime { get; set; }

    public int? CategoryId { get; set; }
}
