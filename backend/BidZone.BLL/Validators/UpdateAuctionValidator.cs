using BidZone.Models.DTOs;
using FluentValidation;

namespace BidZone.BLL.Validators;

public class UpdateAuctionValidator : AbstractValidator<UpdateAuctionDto>
{
    public UpdateAuctionValidator()
    {
        RuleFor(x => x.Title)
            .MaximumLength(200).When(x => x.Title != null);

        RuleFor(x => x.ImageUrl)
            .MaximumLength(500).When(x => x.ImageUrl != null);

        RuleFor(x => x.ReservePrice)
            .GreaterThan(0).When(x => x.ReservePrice.HasValue)
            .WithMessage("Reserve price must be greater than 0");

        RuleFor(x => x.EndTime)
            .GreaterThan(DateTime.UtcNow).When(x => x.EndTime.HasValue)
            .WithMessage("End time must be in the future");

        RuleFor(x => x.CategoryId)
            .GreaterThan(0).When(x => x.CategoryId.HasValue)
            .WithMessage("Invalid category");
    }
}
