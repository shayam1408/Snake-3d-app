# Keep the first full-stack architecture small

## Decision
Use one Express origin, local SQLite, a deterministic coach fallback, and one
optional provider adapter.

## Why
The learner can run, inspect, and explain every boundary before adding hosted
databases, multiple services, or permanent infrastructure.

## Trade-off
This is suitable for a learning project and temporary review. It is not a
claim of production scale, high availability, or multi-user security.
