@echo off

cd /d "%~dp0backend"

start "Gestor Marcenaria - Servidor" cmd /k "npm start"

timeout /t 3 /nobreak > nul

start "" "http://localhost:3001"
