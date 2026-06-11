using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814

namespace BidZone.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class SeedBids : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Auctions",
                columns: new[] { "Id", "CategoryId", "ConcurrencyStamp", "CurrentPrice", "Description", "EndTime", "ImageUrl", "ReservePrice", "SellerId", "Slug", "StartTime", "StartingPrice", "Status", "Title" },
                values: new object[]
                {
                    6, 1, new Guid("a1b2c3d4-0006-0000-0000-000000000006"), 520.00m,
                    "PS5 Digital Edition, like new, includes two controllers",
                    new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc),
                    "https://picsum.photos/seed/ps5/860/600", null, 2,
                    "sony-playstation-5-6",
                    new DateTime(2026, 3, 1, 0, 0, 0, 0, DateTimeKind.Utc),
                    400m, "Active", "Sony PlayStation 5"
                });

            migrationBuilder.InsertData(
                table: "Bids",
                columns: new[] { "Id", "Amount", "AuctionId", "BidderId", "PlacedAt", "Status" },
                values: new object[,]
                {
                    { 1, 1020.00m, 1, 3, new DateTime(2026, 6, 1, 10, 0, 0, 0, DateTimeKind.Utc), "Outbid" },
                    { 2, 1100.00m, 1, 3, new DateTime(2026, 6, 5, 14, 30, 0, 0, DateTimeKind.Utc), "Winning" },
                    { 3, 15500.00m, 2, 2, new DateTime(2026, 6, 2, 9, 0, 0, 0, DateTimeKind.Utc), "Outbid" },
                    { 4, 16200.00m, 2, 3, new DateTime(2026, 6, 4, 11, 0, 0, 0, DateTimeKind.Utc), "Winning" },
                    { 5, 850.00m, 3, 3, new DateTime(2026, 6, 3, 16, 0, 0, 0, DateTimeKind.Utc), "Winning" },
                    { 6, 480.00m, 6, 1000, new DateTime(2026, 6, 6, 10, 0, 0, 0, DateTimeKind.Utc), "Outbid" },
                    { 7, 520.00m, 6, 1000, new DateTime(2026, 6, 8, 15, 0, 0, 0, DateTimeKind.Utc), "Winning" }
                });

            migrationBuilder.UpdateData(
                table: "Auctions",
                keyColumn: "Id",
                keyValue: 1,
                column: "CurrentPrice",
                value: 1100.00m);

            migrationBuilder.UpdateData(
                table: "Auctions",
                keyColumn: "Id",
                keyValue: 2,
                column: "CurrentPrice",
                value: 16200.00m);

            migrationBuilder.UpdateData(
                table: "Auctions",
                keyColumn: "Id",
                keyValue: 3,
                column: "CurrentPrice",
                value: 850.00m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            foreach (var id in new[] { 1, 2, 3, 4, 5, 6, 7 })
            {
                migrationBuilder.DeleteData(table: "Bids", keyColumn: "Id", keyValue: id);
            }

            migrationBuilder.DeleteData(table: "Auctions", keyColumn: "Id", keyValue: 6);

            migrationBuilder.UpdateData(
                table: "Auctions",
                keyColumn: "Id",
                keyValue: 1,
                column: "CurrentPrice",
                value: 999.99m);

            migrationBuilder.UpdateData(
                table: "Auctions",
                keyColumn: "Id",
                keyValue: 2,
                column: "CurrentPrice",
                value: 15000m);

            migrationBuilder.UpdateData(
                table: "Auctions",
                keyColumn: "Id",
                keyValue: 3,
                column: "CurrentPrice",
                value: 800m);
        }
    }
}
