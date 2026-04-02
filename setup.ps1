$ErrorActionPreference = 'Stop'

Write-Host "Initializing Backend..."
Set-Location C:\Users\ASUS\Desktop\SyncSpace
npx -y @nestjs/cli new backend --package-manager npm --skip-git
if ($LASTEXITCODE -ne 0) { Write-Host "Failed to create NestJS app"; exit 1 }

Write-Host "Entering backend directory..."
Set-Location C:\Users\ASUS\Desktop\SyncSpace\backend
npm install @prisma/client @nestjs/jwt @nestjs/passport @nestjs/config passport passport-jwt bcrypt
npm install -D prisma @types/bcrypt @types/passport-jwt
npx prisma init
if ($LASTEXITCODE -ne 0) { Write-Host "Failed to initialize Prisma"; exit 1 }

Write-Host "Initializing Frontend..."
Set-Location C:\Users\ASUS\Desktop\SyncSpace
npm create vite@latest frontend -- --template react-ts
if ($LASTEXITCODE -ne 0) { Write-Host "Failed to create Vite app"; exit 1 }

Write-Host "Entering frontend directory..."
Set-Location C:\Users\ASUS\Desktop\SyncSpace\frontend
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install react-router-dom axios lucide-react zustand clsx tailwind-merge

Write-Host "INITIALIZATION_COMPLETE"
