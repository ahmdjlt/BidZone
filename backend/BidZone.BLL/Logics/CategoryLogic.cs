using AutoMapper;
using BidZone.BLL.Interfaces;
using BidZone.DAL.Interfaces;
using BidZone.Models.DTOs;

namespace BidZone.BLL.Logics;

public class CategoryLogic : ICategoryLogic
{
    private readonly ICategoryRepository _categoryRepo;
    private readonly IMapper _mapper;

    public CategoryLogic(ICategoryRepository categoryRepo, IMapper mapper)
    {
        _categoryRepo = categoryRepo;
        _mapper = mapper;
    }

    public async Task<List<CategoryDto>> GetAllAsync()
    {
        var categories = await _categoryRepo.GetAllAsync();
        return _mapper.Map<List<CategoryDto>>(categories);
    }

    public async Task<CategoryDto?> GetByIdAsync(int id)
    {
        var category = await _categoryRepo.GetByIdAsync(id);
        return category == null ? null : _mapper.Map<CategoryDto>(category);
    }
}
