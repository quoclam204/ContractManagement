# Contract Command

## Purpose
Start a Contract-module workflow:
- inspect requirements
- inspect database
- inspect Workflow reference implementation
- inspect existing Contract code
- propose implementation plan
- wait for approval before coding

## Usage
Use this command at the beginning of any Contract feature work to ensure you have full context and follow established patterns.

## What It Does
1. Reviews the Contract module task description (02_Task_Nguoi2_Contract.md)
2. Inspects database.sql for Contract-related tables (CONTRACT_TYPES, CONTRACT_TEMPLATE_VERSIONS, CONTRACTS)
3. Examines the Workflow module as the reference implementation for Clean Architecture patterns
4. Checks for any existing Contract-related code in the repository
5. Reviews EF Core configurations and DbContext for patterns to follow
6. Examines DTO, service, interface, and event patterns from Workflow module
7. Reviews existing tests for Contract module (if any)
8. Checks architecture documentation for module boundaries and dependency rules
9. Proposes an implementation plan based on findings
10. Waits for explicit approval before any coding begins

## Output
Provides:
- Summary of Contract requirements from task description
- Database schema inspection for Contract tables
- Workflow module reference implementation overview
- Existing Contract code status (files present/missing)
- Recommended file structure following Workflow patterns
- Suggested implementation approach
- List of files to inspect before coding
- Clear instruction to wait for approval before implementing

## Example
Before starting work on Contract CRUD operations:
1. Run this contract command
2. Review the output showing:
   - What the task requires
   - What the database schema expects
   - How the Workflow module is structured (to follow)
   - What Contract files already exist
   - What files need to be created
   - The recommended implementation plan
3. Wait for explicit approval
4. Then proceed with implementation following the plan

This ensures you begin Contract feature work with complete context and follow established patterns without duplicating effort or violating architectural principles.