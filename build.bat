@echo off

set /p VERSION=<version.txt

echo Building updater...
go build ^
  -o build/bin/updater.exe ^
  ./cmd/updater

echo Building app...
wails build ^
  -platform windows/amd64 ^
  -ldflags "-X fish/internal/buildinfo.Version=%VERSION%"

if %errorlevel% neq 0 exit /b %errorlevel%

echo Done.