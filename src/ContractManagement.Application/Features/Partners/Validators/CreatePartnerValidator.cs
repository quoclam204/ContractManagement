using FluentValidation;
using ContractManagement.Application.Features.Partners;

namespace ContractManagement.Application.Features.Partners.Validators;

public class CreatePartnerValidator : AbstractValidator<CreatePartnerCommand>
{
    public CreatePartnerValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tên đối tác là bắt buộc.")
            .MaximumLength(300).WithMessage("Tên đối tác không được vượt quá 300 ký tự.");

        RuleFor(x => x.TaxCode)
            .NotEmpty().WithMessage("Mã số thuế là bắt buộc.")
            .Length(10, 14).WithMessage("Mã số thuế phải có độ dài từ 10 đến 14 ký tự.");

        RuleFor(x => x.ContactEmail)
            .NotEmpty().WithMessage("Email liên hệ là bắt buộc.")
            .EmailAddress().WithMessage("Email liên hệ không đúng định dạng.")
            .MaximumLength(256).WithMessage("Email liên hệ không được vượt quá 256 ký tự.");

        RuleFor(x => x.Representative)
            .MaximumLength(200).WithMessage("Người đại diện không được vượt quá 200 ký tự.");

        RuleFor(x => x.Address)
            .MaximumLength(500).WithMessage("Địa chỉ không được vượt quá 500 ký tự.");
    }
}

public class CreatePartnerRequestValidator : AbstractValidator<CreatePartnerRequest>
{
    public CreatePartnerRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tên đối tác là bắt buộc.")
            .MaximumLength(300).WithMessage("Tên đối tác không được vượt quá 300 ký tự.");

        RuleFor(x => x.TaxCode)
            .NotEmpty().WithMessage("Mã số thuế là bắt buộc.")
            .Length(10, 14).WithMessage("Mã số thuế phải có độ dài từ 10 đến 14 ký tự.");

        RuleFor(x => x.ContactEmail)
            .NotEmpty().WithMessage("Email liên hệ là bắt buộc.")
            .EmailAddress().WithMessage("Email liên hệ không đúng định dạng.")
            .MaximumLength(256).WithMessage("Email liên hệ không được vượt quá 256 ký tự.");

        RuleFor(x => x.Representative)
            .MaximumLength(200).WithMessage("Người đại diện không được vượt quá 200 ký tự.");

        RuleFor(x => x.Address)
            .MaximumLength(500).WithMessage("Địa chỉ không được vượt quá 500 ký tự.");
    }
}