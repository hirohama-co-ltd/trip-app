@echo off
setlocal
cd /d %TEMP%
pushd "%~dp0"
if errorlevel 1 (
  echo pushd failed: %~dp0
  exit /b 1
)
echo PWD: %CD%
echo.
echo === clasp push ===
call clasp.cmd push --force
if errorlevel 1 (
  popd
  exit /b 1
)
echo.
echo === clasp deploy ===
call clasp.cmd deploy -i AKfycbzbZOY2xddntqnXA6J6HERV2zM8GmPxepTK09Od6Gr4lLjOxqbMKK3QN1hIHL-Fm9dXpg -d "DOMAIN公開"
set ERR=%ERRORLEVEL%
popd
exit /b %ERR%
