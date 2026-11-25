# GramVerse AI — PostgreSQL + PostGIS Restore Verification Script (Docker)
param(
    [Parameter(Mandatory = $true)]
    [string]$BackupFile,
    [string]$ContainerName = "gramverse_postgis",
    [string]$DbUser = "postgres",
    [string]$DbName = "gramverse_db"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $BackupFile)) {
    throw "Backup file not found: $BackupFile"
}

Write-Host "Restoring $BackupFile into $DbName on container $ContainerName ..."
docker cp $BackupFile "${ContainerName}:/tmp/gramverse_restore.dump"
docker exec $ContainerName pg_restore -U $DbUser -d $DbName --clean --if-exists --no-owner "/tmp/gramverse_restore.dump"
docker exec $ContainerName rm -f "/tmp/gramverse_restore.dump"

Write-Host "Restore completed successfully."
