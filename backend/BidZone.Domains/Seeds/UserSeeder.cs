using BidZone.Domains.Entities;
using Microsoft.EntityFrameworkCore;

namespace BidZone.Domains.Seeds;

public static class UserSeeder
{
    public static void Seed(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = 1,
                UserName = "admin",
                NormalizedUserName = "ADMIN",
                FullName = "Admin",
                Email = "admin@bidzone.com",
                NormalizedEmail = "ADMIN@BIDZONE.COM",
                PasswordHash = "AQAAAAIAAYagAAAAEIZHtCrpw/j1RV8ISXtKMS02S7jhq1dOzqyCRABr07G8TUzI4aIMYWuS7gRMeHSPnQ==",
                SecurityStamp = "d44e0d8f-0f86-4a4e-a1d9-a6bf29f50a41",
                ConcurrencyStamp = "9a6560ca-cd10-4f76-b0e7-bf8ce5caa5db",
                EmailConfirmed = true,
                Role = "Admin",
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                IsActive = true,
                LockoutEnabled = false
            },
            new User
            {
                Id = 2,
                UserName = "seller1",
                NormalizedUserName = "SELLER1",
                FullName = "Demo Seller",
                Email = "seller1@bidzone.com",
                NormalizedEmail = "SELLER1@BIDZONE.COM",
                PasswordHash = "AQAAAAIAAYagAAAAEOKn3iS6zRXJxbYnH6fG8R8bds/7coXisLNnePfdl5rCa0DW6Ot8z1NGUFbv4oCzUg==",
                SecurityStamp = "d15f4865-12ec-4880-9a8e-efec8d61cb08",
                ConcurrencyStamp = "ec1d3f44-1730-4bd3-836d-a7da7318afdb",
                EmailConfirmed = true,
                Role = "Seller",
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                IsActive = true,
                LockoutEnabled = false
            },
            new User
            {
                Id = 1000,
                UserName = "bidzone",
                NormalizedUserName = "BIDZONE",
                FullName = "BidZone Admin",
                Email = "bidzone@admin.com",
                NormalizedEmail = "BIDZONE@ADMIN.COM",
                PasswordHash = "AQAAAAIAAYagAAAAEKyY8Y+6VNQGOb6NT850FBSBAjw+eJjswfXEelYY8zvEfyP3O4vpyk21PMSKa1tOFQ==",
                SecurityStamp = "b1d2a3c4-5e6f-7890-abcd-ef0123456789",
                ConcurrencyStamp = "f0e1d2c3-b4a5-6789-0123-456789abcdef",
                EmailConfirmed = true,
                Role = "Admin",
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                IsActive = true,
                LockoutEnabled = false
            },
            new User
            {
                Id = 3,
                UserName = "buyer1",
                NormalizedUserName = "BUYER1",
                FullName = "Demo Buyer",
                Email = "buyer1@bidzone.com",
                NormalizedEmail = "BUYER1@BIDZONE.COM",
                PasswordHash = "AQAAAAIAAYagAAAAEOxt2/uhhLlq+OgQNwz+4tkYkTas/HpQkGc/LtTIqctryoEiRDsrvJEqQ6AChKzgCQ==",
                SecurityStamp = "9db95bff-3eeb-4a2d-afd1-af80e0c31db2",
                ConcurrencyStamp = "87fda966-f7ca-4f43-a6f2-dcb92c1a24cf",
                EmailConfirmed = true,
                Role = "Buyer",
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                IsActive = true,
                LockoutEnabled = false
            }
        );
    }
}
