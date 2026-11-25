# GramVerse AI — Automated PostgreSQL + PostGIS Backup Script (Docker)
param(
    [string]$ContainerName = "gramverse_postgis",
    [string]$DbUser = "postgres",
    [string]$DbName = "gramverse_db",
    [string]$BackupDir = "$PSScriptRoot\..\..\backups",
    [int]$KeepLast = 7
)

$ErrorActionPreference = "Stop"

New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = Join-Path $BackupDir "gramverse_${timestamp}.dump"

Write-Host "Creating custom-format PostGIS backup at $backupFile ..."
docker exec $ContainerName pg_dump -U $DbUser -d $DbName -Fc -f "/tmp/gramverse_backup.dump"
docker cp "${ContainerName}:/tmp/gramverse_backup.dump" $backupFile
docker exec $ContainerName rm -f "/tmp/gramverse_backup.dump"

Get-ChildItem -Path $BackupDir -Filter "gramverse_*.dump" |
    Sort-Object LastWriteTime -Descending |
    Select-Object -Skip $KeepLast |
    Remove-Item -Force

Write-Host "Backup completed successfully: $backupFile"
