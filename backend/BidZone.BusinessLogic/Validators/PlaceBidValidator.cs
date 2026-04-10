using BidZone.Domains.DTOs;
using FluentValidation;

namespace BidZone.BusinessLogic.Validators;

public class PlaceBidValidator : AbstractValidator<PlaceBidDto>
{
    public PlaceBidValidator()
    {
        RuleFor(x => x.AuctionId)
            .GreaterThan(0).WithMessage("Auction ID is required");

        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Bid amount must be greater than 0");
    }
}
