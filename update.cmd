@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
echo 仅更新网站文件：构建、上传、切换版本，沿用服务器现有 HTTPS 配置。
call "%~dp0deploy.cmd" --update-only
exit /b %errorlevel%
