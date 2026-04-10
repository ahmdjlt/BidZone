using BidZone.Domains.DTOs;
using FluentValidation;

namespace BidZone.BusinessLogic.Validators;

public class CreateAuctionValidator : AbstractValidator<CreateAuctionDto>
{
    public CreateAuctionValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required")
            .MaximumLength(200).WithMessage("Title must not exceed 200 characters");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required");

        RuleFor(x => x.ImageUrl)
            .MaximumLength(500).When(x => x.ImageUrl != null);

        RuleFor(x => x.StartingPrice)
            .GreaterThan(0).WithMessage("Starting price must be greater than 0");

        RuleFor(x => x.ReservePrice)
            .GreaterThanOrEqualTo(x => x.StartingPrice)
            .When(x => x.ReservePrice.HasValue)
            .WithMessage("Reserve price must be at least the starting price");

        RuleFor(x => x.EndTime)
            .GreaterThan(DateTime.UtcNow).WithMessage("End time must be in the future");

        RuleFor(x => x.CategoryId)
            .GreaterThan(0).WithMessage("Category is required");
    }
}
