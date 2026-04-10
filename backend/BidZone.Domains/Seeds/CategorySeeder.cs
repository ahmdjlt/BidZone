using BidZone.Domains.Entities;
using Microsoft.EntityFrameworkCore;

namespace BidZone.Domains.Seeds;

public static class CategorySeeder
{
    public static void Seed(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Category>().HasData(
            new Category { Id = 1, Name = "Art", Slug = "art" },
            new Category { Id = 2, Name = "Interiors", Slug = "interiors" },
            new Category { Id = 3, Name = "Jewellery", Slug = "jewellery" },
            new Category { Id = 4, Name = "Watches", Slug = "watches" },
            new Category { Id = 5, Name = "Fashion", Slug = "fashion" },
            new Category { Id = 6, Name = "Coins & Stamps", Slug = "coins-stamps" },
            new Category { Id = 7, Name = "Comics", Slug = "comics" },
            new Category { Id = 8, Name = "Cars & Bikes", Slug = "cars-bikes" },
            new Category { Id = 9, Name = "Wine & Spirits", Slug = "wine-spirits" },
            new Category { Id = 10, Name = "Electronics", Slug = "electronics" },
            new Category { Id = 11, Name = "Collectibles", Slug = "collectibles" },
            new Category { Id = 12, Name = "Sports", Slug = "sports" },
            new Category { Id = 13, Name = "Books", Slug = "books" },
            new Category { Id = 14, Name = "Toys", Slug = "toys" },
            new Category { Id = 15, Name = "Photography", Slug = "photography" },
            new Category { Id = 16, Name = "Musical", Slug = "musical" }
        );
    }
}
