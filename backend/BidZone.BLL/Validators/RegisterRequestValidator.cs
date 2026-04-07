using BidZone.Models.DTOs;
using FluentValidation;

namespace BidZone.BLL.Validators;

public class RegisterRequestValidator : AbstractValidator<RegisterRequestDto>
{
    private static readonly string[] AllowedRoles = ["Buyer", "Seller"];

    public RegisterRequestValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Username is required")
            .MaximumLength(50).WithMessage("Username must not exceed 50 characters");

        RuleFor(x => x.FullName)
            .MaximumLength(100).WithMessage("Full name must not exceed 100 characters");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Invalid email format")
            .MaximumLength(100);

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required")
            .MinimumLength(8).WithMessage("Password must be at least 8 characters");

        RuleFor(x => x.Role)
            .NotEmpty().WithMessage("Role is required")
            .Must(r => AllowedRoles.Contains(r, StringComparer.OrdinalIgnoreCase))
            .WithMessage("Role must be Buyer or Seller");
    }
}
