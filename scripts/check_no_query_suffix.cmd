@echo off
REM Shim to run the bash-based check script via Git Bash on Windows
REM This uses %ProgramFiles% which typically expands to "C:\Program Files"
setlocal
set SCRIPT_DIR=%~dp0
"%ProgramFiles%\Git\bin\bash.exe" "%SCRIPT_DIR%check_no_query_suffix.sh" %*
exit /b %ERRORLEVEL%
