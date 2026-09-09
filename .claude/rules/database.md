# Database Rules

## Source of Truth
- `database.sql` is the authoritative source for the existing database schema.
- Always inspect the schema before creating EF Core entities or configurations.

## Schema Matching
- Match table names, column names, SQL types, nullability, and constraints exactly.
- Do not invent columns or relationships.
- Do not create duplicate entities for existing tables.

## Indexes and Constraints
- Preserve existing indexes and unique constraints.
- Respect existing RowVersion/concurrency configuration (do not remove or ignore RowVersion columns).

## Migrations
- Do not create or apply migrations automatically.
- Any schema change must be explicitly reviewed and approved before implementation.
- Never create a migration merely to make the code compile.

## Safety
- Never use destructive database operations automatically (e.g., dropping tables).
- Never drop or recreate existing tables as a shortcut.
- If a schema change is required, it must be done via a migration script that is reviewed and tested.

## Contract-Specific
- For the Contract module, pay special attention to the CONTRACTS, CONTRACT_TYPES, and CONTRACT_TEMPLATE_VERSIONS tables.
- The contract status values are defined in the database schema comment: 0=Draft,1=PendingApproval,2=Approved,3=Signed,4=Active,5=Expiring,6=Renewed,7=Terminated.
- Do not invent additional status values or change the meaning of existing ones.
