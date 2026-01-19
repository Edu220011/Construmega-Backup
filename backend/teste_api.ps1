# Teste da API criar-carrinho
$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    usuarioId = "913136"
    itens = @(
        @{
            produtoId = "4"
            quantidade = 1
        }
    )
} | ConvertTo-Json -Depth 3

Write-Host "🧪 Testando rota /pagamento/criar-carrinho..."
Write-Host "Body enviado: $body"

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/pagamento/criar-carrinho" -Method POST -Headers $headers -Body $body
    Write-Host "✅ Sucesso!"
    Write-Host "Response: $($response | ConvertTo-Json -Depth 3)"
} catch {
    Write-Host "❌ Erro: $($_.Exception.Message)"
    Write-Host "Status: $($_.Exception.Response.StatusCode)"
    Write-Host "Detalhes: $($_.ErrorDetails.Message)"
}