using System;
using MediatR;

namespace ContractManagement.Application.Features.Partners
{
    public record GetPartnersQuery : IRequest<List<PartnerDto>>;
}