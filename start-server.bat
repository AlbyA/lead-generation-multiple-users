@echo off
echo Starting local web server...
echo.
echo Opening browser at http://localhost:8080
echo Press Ctrl+C to stop the server
echo.
cd /d "%~dp0"
npx --yes http-server -p 8080 -o

