@echo off
REM Verifica se o script está sendo executado como administrador
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Executando como administrador.
) else (
    echo AVISO: Este script precisa ser executado como administrador para finalizar processos na porta 3000.
    echo Clique com o botao direito no arquivo .bat e selecione "Executar como administrador".
    pause
    exit /b 1
)

REM Fecha qualquer processo usando a porta 3000 e 3001
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
	echo Finalizando processo na porta 3000: %%a
	taskkill /PID %%a /F
	if %errorLevel% neq 0 (
		echo ERRO: Nao foi possivel finalizar o processo %%a. Verifique permissoes.
	)
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
	echo Finalizando processo na porta 3001: %%a
	taskkill /PID %%a /F
	if %errorLevel% neq 0 (
		echo ERRO: Nao foi possivel finalizar o processo %%a. Verifique permissoes.
	)
)
REM Aguarda alguns segundos para garantir que a porta foi liberada
ping 127.0.0.1 -n 3 > nul
REM Inicia backend e frontend normalmente
cd /d "%~dp0backend"
start cmd /k "npm install && node index.js"
cd /d "%~dp0frontend"
start cmd /k "npm install && npm start"
cd /d "%~dp0"
echo Backend e frontend iniciados em terminais separados.
echo.
echo =============================================
echo ACESSE O SISTEMA SEMPRE POR: http://localhost:3000
echo (Assim o proxy do frontend funcionara corretamente)
echo =============================================
pause
