# V1 security review

- Public GET routes expose only published records and serialize database rows without bigint leakage.
- Editorial GET/POST routes require `EDITORIAL_ADMIN_TOKEN`; store it only in Vercel Environment Variables and local `.env`.
- Database credentials never enter client bundles.
- All editorial inputs are validated before repository writes.
- Production writes should be migrated to user/role authentication before opening the console to multiple editors.
- Rotate the admin token after suspected disclosure and review audit logs.
- Add rate limiting and CSRF protection before public authenticated submissions.
