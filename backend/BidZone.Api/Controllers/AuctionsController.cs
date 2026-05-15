using BidZone.BusinessLogic.Interface;
using BidZone.Api.Extensions;
using BidZone.Domains.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BusinessLogicFactory = BidZone.BusinessLogic.BusinessLogic;

namespace BidZone.Api.Controllers;

[ApiController]
[Route("api/auctions")]
public class AuctionsController : ControllerBase
{
    internal IAuctionLogic _auction;

    public AuctionsController()
    {
        var bl = new BusinessLogicFactory();
        _auction = bl.AuctionAction();
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
        var auctions = await _auction.GetAllAsync(search, category, sort, status, minPrice, maxPrice);
        return Ok(auctions);
    }

    [HttpGet("paged")]
    public async Task<IActionResult> GetAllPaged(
        [FromQuery] string? search,
        [FromQuery] string? category,
        [FromQuery] string? sort,
        [FromQuery] string? status,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12)
    {
        var pagination = new PaginationParams { Page = page, PageSize = pageSize };
        var result = await _auction.GetAllPagedAsync(search, category, sort, status, minPrice, maxPrice, pagination);
        return Ok(result);
    }

    [HttpGet("slug/{slug}")]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var auction = await _auction.GetBySlugAsync(slug);
        if (auction == null)
            return NotFound();
        return Ok(auction);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var auction = await _auction.GetByIdAsync(id);
        if (auction == null)
            return NotFound();
        return Ok(auction);
    }

    [HttpGet("{id}/contact")]
    [Authorize]
    public async Task<IActionResult> GetContact(int id)
    {
        var userId = User.GetRequiredUserId();
        var contact = await _auction.GetContactForUserAsync(id, userId);
        if (contact == null)
            return NotFound();
        return Ok(contact);
    }

    [HttpPost]
    [Authorize(Roles = "Seller,Admin")]
    public async Task<IActionResult> Create([FromBody] CreateAuctionDto dto)
    {
        var sellerId = User.GetRequiredUserId();
        var auction = await _auction.CreateAsync(dto, sellerId);
        return CreatedAtAction(nameof(GetBySlug), new { slug = auction.Slug }, auction);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Seller,Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateAuctionDto dto)
    {
        var sellerId = User.GetRequiredUserId();
        var auction = await _auction.UpdateAsync(id, dto, sellerId);
        if (auction == null)
            return NotFound();
        return Ok(auction);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Seller,Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var sellerId = User.GetRequiredUserId();
        var result = await _auction.DeleteAsync(id, sellerId);
        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpGet("my")]
    [Authorize(Roles = "Seller,Admin")]
    public async Task<IActionResult> GetMyAuctions()
    {
        var sellerId = User.GetRequiredUserId();
        var auctions = await _auction.GetBySellerAsync(sellerId);
        return Ok(auctions);
    }
}
