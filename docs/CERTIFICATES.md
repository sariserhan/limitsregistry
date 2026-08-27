# Registry certificates

A certificate attests to a Registry decision at a point in time. It does not claim permanent or universal truth.

## Issuance gate

The protected editorial `issue-certificate` action accepts only an `ACCEPTED` Claim with linked evidence and at least two accepted reviews. The certificate stores a canonical JSON snapshot and its SHA-256 hash. If `CERTIFICATE_SIGNING_PRIVATE_KEY` is configured, the hash is additionally signed with Ed25519.

Certificate types are `CLAIM_ACCEPTED` and `RECORD_ESTABLISHED`. Future changes should supersede or revoke a certificate; they must not mutate its snapshot or hash.
