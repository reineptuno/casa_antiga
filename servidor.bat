@echo off
title Casa Antiga — Servidor Local
cd /d "%~dp0"

echo.
echo  Casa Antiga — Servidor Local
echo  ==============================
echo.

:: Try Python 3
python --version >nul 2>&1
if %errorlevel% == 0 (
  echo  A iniciar servidor em http://localhost:8080
  echo  Prima Ctrl+C para parar.
  echo.
  start "" http://localhost:8080
  python -m http.server 8080
  goto :end
)

:: Try py launcher
py --version >nul 2>&1
if %errorlevel% == 0 (
  echo  A iniciar servidor em http://localhost:8080
  echo  Prima Ctrl+C para parar.
  echo.
  start "" http://localhost:8080
  py -m http.server 8080
  goto :end
)

:: Try Node / npx
npx --version >nul 2>&1
if %errorlevel% == 0 (
  echo  A iniciar servidor em http://localhost:3000
  echo  Prima Ctrl+C para parar.
  echo.
  start "" http://localhost:3000
  npx serve . -l 3000
  goto :end
)

echo  ERRO: Nao foi encontrado Python nem Node.js.
echo  Instala um dos seguintes:
echo    - Python: https://www.python.org/downloads/
echo    - Node.js: https://nodejs.org/
echo.
pause

:end
