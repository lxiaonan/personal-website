@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
set "DEPLOY_NODE="
where.exe node >nul 2>&1
if not errorlevel 1 set "DEPLOY_NODE=node"
if not defined DEPLOY_NODE if exist "D:\nodejs\node.exe" set "DEPLOY_NODE=D:\nodejs\node.exe"
if not defined DEPLOY_NODE if exist "%ProgramFiles%\nodejs\node.exe" set "DEPLOY_NODE=%ProgramFiles%\nodejs\node.exe"
if not defined DEPLOY_NODE (
  echo 请先安装 Node.js 22.12 或更高版本：https://nodejs.org/
  pause
  exit /b 1
)
"%DEPLOY_NODE%" scripts\deploy.mjs %*
set "DEPLOY_EXIT=%errorlevel%"
echo.
if not "%DEPLOY_EXIT%"=="0" echo 部署没有完成，请查看上方错误。修正后可以再次双击本文件。
pause
exit /b %DEPLOY_EXIT%
