# V1 security review

- Public GET routes expose only published records and serialize database rows without bigint leakage.
- Editorial GET/POST routes (`app/api/editorial`) require a Better Auth session with role EDITOR or above — no shared token.
- Database credentials never enter client bundles.
- All editorial inputs are validated before repository writes.
- `record-review` always attributes the review to the authenticated session's user ID; a caller cannot spoof `reviewerUserId`.
- Add rate limiting and CSRF protection before public authenticated submissions.
- Source PDF ingestion uses exact-host allowlisting, credential-free HTTPS, public-DNS checks, manual redirect validation, MIME/signature checks, bounded streaming, and durable retry/failure states. Publisher hosts are configured only through `PDF_PUBLISHER_ALLOWLIST`; arXiv is built in.
