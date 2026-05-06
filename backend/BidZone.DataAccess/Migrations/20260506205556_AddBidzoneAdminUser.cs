using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BidZone.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddBidzoneAdminUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "AccessFailedCount", "ConcurrencyStamp", "CreatedAt", "Email", "EmailConfirmed", "FullName", "IsActive", "LockoutEnabled", "LockoutEnd", "NormalizedEmail", "NormalizedUserName", "PasswordHash", "PhoneNumber", "PhoneNumberConfirmed", "Role", "SecurityStamp", "TwoFactorEnabled", "Username" },
                values: new object[] { 1000, 0, "f0e1d2c3-b4a5-6789-0123-456789abcdef", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "bidzone@admin.com", true, "BidZone Admin", true, false, null, "BIDZONE@ADMIN.COM", "BIDZONE_ADMIN", "AQAAAAIAAYagAAAAEKyY8Y+6VNQGOb6NT850FBSBAjw+eJjswfXEelYY8zvEfyP3O4vpyk21PMSKa1tOFQ==", null, false, "Admin", "b1d2a3c4-5e6f-7890-abcd-ef0123456789", false, "bidzone_admin" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1000);
        }
    }
}
