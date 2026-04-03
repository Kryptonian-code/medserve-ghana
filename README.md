# MedServe Ghana

MedServe Ghana is a pharmacy storefront and operations platform with customer ordering, prescription review, and role-aware administration.

## Local development

1. Start the PHP API:

```powershell
C:\xampp\php\php.exe -S 127.0.0.1:8000 -t backend backend/router.php
```

2. Start the frontend:

```powershell
npm run dev -- --host 127.0.0.1
```

3. Build for production:

```powershell
npm run build
```

## Database

- Runtime development storage uses a local SQLite file in `backend/storage/medserve.sqlite`.
- A clean MySQL-compatible schema for phpMyAdmin or XAMPP imports is available at [database/schema.sql](c:/Users/bigjo/Desktop/apps/Websites/medserve-ghana/database/schema.sql).
- No demo records or default accounts are included in the schema.

## Create the first administrator

Use the CLI helper to create the first privileged account after the database is ready:

```powershell
C:\xampp\php\php.exe backend/setup-admin.php admin@example.com "StrongPasswordHere" FirstName LastName super_admin
```

## Security notes

- Session cookies are HTTP-only and same-site protected.
- Mutating requests require a CSRF token.
- Login attempts are rate limited.
- File uploads are validated by extension, MIME type, and size.
