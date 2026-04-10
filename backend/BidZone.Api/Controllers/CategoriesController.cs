using BidZone.BusinessLogic.Interface;
using Microsoft.AspNetCore.Mvc;

namespace BidZone.Api.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoriesController : ControllerBase
{
    private readonly IBusinessLogic _businessLogic;

    public CategoriesController(IBusinessLogic businessLogic)
    {
        _businessLogic = businessLogic;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var categories = await _businessLogic.Categories.GetAllAsync();
        return Ok(categories);
    }

    [HttpGet("{id}/auctions")]
    public async Task<IActionResult> GetAuctionsByCategory(int id)
    {
        var auctions = await _businessLogic.Auctions.GetByCategoryAsync(id);
        return Ok(auctions);
    }
}
