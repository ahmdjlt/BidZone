using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BidZone.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSeedImageUrls : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Auctions",
                keyColumn: "Id",
                keyValue: 1,
                column: "ImageUrl",
                value: "https://picsum.photos/seed/iphone15/860/600");

            migrationBuilder.UpdateData(
                table: "Auctions",
                keyColumn: "Id",
                keyValue: 2,
                column: "ImageUrl",
                value: "https://picsum.photos/seed/rolex/860/600");

            migrationBuilder.UpdateData(
                table: "Auctions",
                keyColumn: "Id",
                keyValue: 3,
                column: "ImageUrl",
                value: "https://picsum.photos/seed/trek/860/600");

            migrationBuilder.UpdateData(
                table: "Auctions",
                keyColumn: "Id",
                keyValue: 4,
                column: "ImageUrl",
                value: "https://picsum.photos/seed/painting/860/600");

            migrationBuilder.UpdateData(
                table: "Auctions",
                keyColumn: "Id",
                keyValue: 5,
                column: "ImageUrl",
                value: "https://picsum.photos/seed/tesla/860/600");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Auctions",
                keyColumn: "Id",
                keyValue: 1,
                column: "ImageUrl",
                value: "/images/iphone15.jpg");

            migrationBuilder.UpdateData(
                table: "Auctions",
                keyColumn: "Id",
                keyValue: 2,
                column: "ImageUrl",
                value: "/images/rolex.jpg");

            migrationBuilder.UpdateData(
                table: "Auctions",
                keyColumn: "Id",
                keyValue: 3,
                column: "ImageUrl",
                value: "/images/trek.jpg");

            migrationBuilder.UpdateData(
                table: "Auctions",
                keyColumn: "Id",
                keyValue: 4,
                column: "ImageUrl",
                value: "/images/painting.jpg");

            migrationBuilder.UpdateData(
                table: "Auctions",
                keyColumn: "Id",
                keyValue: 5,
                column: "ImageUrl",
                value: "/images/tesla.jpg");
        }
    }
}
