namespace be_contractmgmt.Models;

public class Contract
{
    public int Id { get; set; }
    public string ContractNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
}