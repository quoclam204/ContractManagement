# Inspect Command

## Purpose
Inspect repository architecture and report findings without changing files.

## Usage
Use this command to understand the current state before making changes.

## What It Does
1. Checks solution/project structure
2. Reviews existing Contract module implementation (if any)
3. Examines Workflow module as reference implementation
4. Inspects database.sql for Contract-related tables
5. Verifies EF Core configurations match schema
6. Checks layer dependencies and module boundaries
7. Reviews existing tests and testing patterns
8. Examines coding conventions and patterns
9. Reports findings without modifying any files

## Output
Provides a structured report including:
- Current architecture overview
- Existing Contract module status (files present/missing)
- Database schema inspection results
- Layer dependency verification
- Module boundary analysis
- Testing coverage assessment
- Coding convention compliance
- Recommendations for next steps

## Example
When starting work on a Contract feature, run this command first to:
- See what Contract-related files already exist
- Understand the database schema for Contracts
- Review how the Workflow module is implemented
- Check for any existing architecture violations
- Learn the established patterns to follow

This ensures you begin work with full context and avoid duplicating effort or violating architectural principles.
