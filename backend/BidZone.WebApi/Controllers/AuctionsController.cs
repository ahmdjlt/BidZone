using BidZone.BLL.Interfaces;
using BidZone.Models.DTOs;
using BidZone.WebApi.Filters;
using Microsoft.AspNetCore.Mvc;

namespace BidZone.WebApi.Controllers;

[ApiController]
[Route("api/auctions")]
public class AuctionsController : ControllerBase
{
    private readonly IAuctionLogic _auctionLogic;

    public AuctionsController(IAuctionLogic auctionLogic)
    {
        _auctionLogic = auctionLogic;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? category,
        [FromQuery] string? sort,
        [FromQuery] string? status)
    {
        var auctions = await _auctionLogic.GetAllAsync(search, category, sort, status);
        return Ok(auctions);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var auction = await _auctionLogic.GetByIdAsync(id);
        if (auction == null)
            return NotFound();
        return Ok(auction);
    }

    [HttpPost]
    [AuthorizeRoles("Seller", "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateAuctionDto dto)
    {
        var sellerId = (int)HttpContext.Items["UserId"]!;
        var auction = await _auctionLogic.CreateAsync(dto, sellerId);
        return CreatedAtAction(nameof(GetById), new { id = auction.Id }, auction);
    }

    [HttpPut("{id}")]
    [AuthorizeRoles("Seller", "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateAuctionDto dto)
    {
        var sellerId = (int)HttpContext.Items["UserId"]!;
        var auction = await _auctionLogic.UpdateAsync(id, dto, sellerId);
        if (auction == null)
            return NotFound();
        return Ok(auction);
    }

    [HttpDelete("{id}")]
    [AuthorizeRoles("Seller", "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var sellerId = (int)HttpContext.Items["UserId"]!;
        var result = await _auctionLogic.DeleteAsync(id, sellerId);
        if (!result)
            return BadRequest(new { message = "Cannot delete auction with existing bids" });
        return NoContent();
    }

    [HttpGet("my")]
    [AuthorizeRoles("Seller", "Admin")]
    public async Task<IActionResult> GetMyAuctions()
    {
        var sellerId = (int)HttpContext.Items["UserId"]!;
        var auctions = await _auctionLogic.GetBySellerAsync(sellerId);
        return Ok(auctions);
    }
}
