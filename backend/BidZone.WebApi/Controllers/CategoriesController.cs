using BidZone.BLL.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BidZone.WebApi.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryLogic _categoryLogic;
    private readonly IAuctionLogic _auctionLogic;

    public CategoriesController(ICategoryLogic categoryLogic, IAuctionLogic auctionLogic)
    {
        _categoryLogic = categoryLogic;
        _auctionLogic = auctionLogic;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var categories = await _categoryLogic.GetAllAsync();
        return Ok(categories);
    }

    [HttpGet("{id}/auctions")]
    public async Task<IActionResult> GetAuctionsByCategory(int id)
    {
        var auctions = await _auctionLogic.GetByCategoryAsync(id);
        return Ok(auctions);
    }
}
