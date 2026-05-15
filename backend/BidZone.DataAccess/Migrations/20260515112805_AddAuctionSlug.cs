using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BidZone.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddAuctionSlug : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Slug",
                table: "Auctions",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.Sql(@"
                UPDATE ""Auctions""
                SET ""Slug"" = lower(
                    regexp_replace(
                        regexp_replace(""Title"", '[^a-zA-Z0-9 ]', '', 'g'),
                        '\s+', '-', 'g'
                    )
                ) || '-' || CAST(""Id"" AS text)
                WHERE ""Slug"" IS NULL;
            ");

            migrationBuilder.AlterColumn<string>(
                name: "Slug",
                table: "Auctions",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Auctions_Slug",
                table: "Auctions",
                column: "Slug",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Auctions_Slug",
                table: "Auctions");

            migrationBuilder.DropColumn(
                name: "Slug",
                table: "Auctions");
        }
    }
}
