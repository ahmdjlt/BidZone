using System.ComponentModel.DataAnnotations;

namespace BidZone.Domains.Entities;

public class Category
{
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Slug { get; set; } = string.Empty;

    public ICollection<Auction> Auctions { get; set; } = new List<Auction>();
}
