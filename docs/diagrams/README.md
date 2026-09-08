# Architecture Diagrams

This directory contains Mermaid diagrams that visualize the Contract Management System architecture.

## Diagram List

1. [Overall Architecture](architecture.mmd) - Shows the Clean Architecture layers and data flow
2. [Module Boundaries](module-boundaries.mmd) - Shows the eight bounded contexts and their relationships
3. [Dependency Rules](dependency-rules.mmd) - Shows legal and illegal dependencies between layers
4. [Contract Lifecycle](contract-lifecycle.mmd) - Shows the contract state machine
5. [Approval Workflow](approval-workflow.mmd) - Shows the contract approval process
6. [Upload to AI Analysis](upload-to-ai-analysis.mmd) - Shows the document processing flow
7. [Approval to Notification](approval-to-notification.mmd) - Shows notification triggering
8. [Contract Expiry Notification](contract-expiry-notification.mmd) - Shows expiry notification flow

## How to View
These `.mmd` files can be viewed using:
- Mermaid Live Editor (https://mermaid.live)
- VS Code with Mermaid extension
- GitHub/GitLab (automatically rendered)
- Mermaid CLI for local rendering

## Diagram Conventions
- Rectangles represent components/modules
- Arrows represent dependencies or data flow
- Solid lines = synchronous calls
- Dashed lines = asynchronous communication or events
- Different colors may be used to distinguish layer types
