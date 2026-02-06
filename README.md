# Change Log
## 2026-02-07
### Added
- Added tests/ folder
- Added .env.test (the same config with .env.development)
- Added jest and supertest dependencies to package.json
### Changed
- Added test config in config/config.js
- Changed code structure and comments in middleware/authentication.js
- Changed scripts in package.json
## 2026-01-29
### Added
- Added authorization.js, upload.js files to middleware/
- Added multer dependency to .package.json
## 2026-01-22
### Changed
Changed token into access token + refresh token.
- .env.development
- .env.production
- appConfig.js
## 2026-01-19
### Changed
- controller/
- middleware/authentication.js
- migrations/
- models/
- router/
- seeders/
- service/
- .gitignore --> untrack logs*, package-lock.json
- app.js --> config routers
- appConfig.js --> override develop environment with local
- package.json --> add nodemailer dependency
