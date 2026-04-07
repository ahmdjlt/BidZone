using Microsoft.EntityFrameworkCore;

namespace BidZone.Models.Seeds;

public static class DatabaseSeeder
{
    public static void Seed(ModelBuilder modelBuilder)
    {
        CategorySeeder.Seed(modelBuilder);
        UserSeeder.Seed(modelBuilder);
        AuctionSeeder.Seed(modelBuilder);
    }
}
