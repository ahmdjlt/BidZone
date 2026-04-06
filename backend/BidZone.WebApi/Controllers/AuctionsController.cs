using BidZone.BLL.Interfaces;
using BidZone.Models.DTOs;
using BidZone.WebApi.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BidZone.WebApi.Controllers;

[ApiController]
[Route("api/auctions")]
public class AuctionsController : ControllerBase
{
    private readonly IBusinessLogic _businessLogic;

    public AuctionsController(IBusinessLogic businessLogic)
    {
        _businessLogic = businessLogic;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? category,
        [FromQuery] string? sort,
        [FromQuery] string? status,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice)
    {
        var auctions = await _businessLogic.Auctions.GetAllAsync(search, category, sort, status, minPrice, maxPrice);
        return Ok(auctions);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var auction = await _businessLogic.Auctions.GetByIdAsync(id);
        if (auction == null)
            return NotFound();
        return Ok(auction);
    }

    [HttpPost]
    [Authorize(Roles = "Seller,Admin")]
    public async Task<IActionResult> Create([FromBody] CreateAuctionDto dto)
    {
        var sellerId = User.GetRequiredUserId();
        var auction = await _businessLogic.Auctions.CreateAsync(dto, sellerId);
        return CreatedAtAction(nameof(GetById), new { id = auction.Id }, auction);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Seller,Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateAuctionDto dto)
    {
        var sellerId = User.GetRequiredUserId();
        var auction = await _businessLogic.Auctions.UpdateAsync(id, dto, sellerId);
        if (auction == null)
            return NotFound();
        return Ok(auction);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Seller,Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var sellerId = User.GetRequiredUserId();
        var result = await _businessLogic.Auctions.DeleteAsync(id, sellerId);
        if (!result)
            return BadRequest(new { message = "Cannot delete auction with existing bids" });
        return NoContent();
    }

    [HttpGet("my")]
    [Authorize(Roles = "Seller,Admin")]
    public async Task<IActionResult> GetMyAuctions()
    {
        var sellerId = User.GetRequiredUserId();
        var auctions = await _businessLogic.Auctions.GetBySellerAsync(sellerId);
        return Ok(auctions);
    }
}
