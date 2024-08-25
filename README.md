# Resilient Email Sending Service

## Setup Instructions

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Run `npm test` to execute unit tests.

## Assumptions

- The mock email providers simulate email sending, with a random failure rate.
- The rate limit is applied globally across all providers.
- Exponential backoff is implemented with a factor of 1000ms.
- Idempotency is ensured by tracking sent email IDs in a set.

## Features

- Retry mechanism with exponential backoff.
- Fallback between providers on failure.
- Idempotency to prevent duplicate sends.
- Rate limiting to prevent overwhelming providers.
- Status tracking for email sending attempts.
