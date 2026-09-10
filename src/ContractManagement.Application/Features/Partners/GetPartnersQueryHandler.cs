using ContractManagement.Application.Common.Interfaces;
using ContractManagement.Application.Features.Partners;
using ContractManagement.Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ContractManagement.Application.Features.Partners
{
    public class GetPartnersQueryHandler : IRequestHandler<GetPartnersQuery, List<PartnerDto>>
    {
        private readonly IPartnerDbContext _context;

        public GetPartnersQueryHandler(IPartnerDbContext context)
        {
            _context = context;
        }

        public async Task<List<PartnerDto>> Handle(GetPartnersQuery request, CancellationToken cancellationToken)
        {
            var partners = await _context.Partners
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            return partners.Select(p => new PartnerDto
            {
                Id = p.Id,
                Name = p.Name,
                TaxCode = p.TaxCode,
                Representative = p.Representative,
                ContactEmail = p.ContactEmail,
                Address = p.Address,
                CreatedAt = p.CreatedAt
            }).ToList();
        }
    }
}