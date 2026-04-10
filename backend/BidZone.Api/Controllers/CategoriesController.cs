using BidZone.BusinessLogic.Interface;
using Microsoft.AspNetCore.Mvc;
using BusinessLogicFactory = BidZone.BusinessLogic.BusinessLogic;

namespace BidZone.Api.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoriesController : ControllerBase
{
    internal ICategoryLogic _category;
    internal IAuctionLogic _auction;

    public CategoriesController()
    {
        var bl = new BusinessLogicFactory();
        _category = bl.CategoryAction();
        _auction = bl.AuctionAction();
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var categories = await _category.GetAllAsync();
        return Ok(categories);
    }

    [HttpGet("{id}/auctions")]
    public async Task<IActionResult> GetAuctionsByCategory(int id)
    {
        var auctions = await _auction.GetByCategoryAsync(id);
        return Ok(auctions);
    }
}
