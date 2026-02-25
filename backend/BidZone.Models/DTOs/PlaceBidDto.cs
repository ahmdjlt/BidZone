using System.ComponentModel.DataAnnotations;

namespace BidZone.Models.DTOs;

public class PlaceBidDto
{
    [Required]
    public int AuctionId { get; set; }

    [Required]
    public decimal Amount { get; set; }
}
