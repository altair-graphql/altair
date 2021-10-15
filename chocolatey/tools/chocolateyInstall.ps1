$ErrorActionPreference = 'Stop'; # stop on all errors
$toolsDir   = "$(Split-Path -parent $MyInvocation.MyCommand.Definition)"
# TODO: Update urls
# $url        = 'https://github.com/imolorhe/altair/releases/download/v2.4.3/altair_4.0.11_x64_win.exe'
# $url64      = 'https://github.com/imolorhe/altair/releases/download/v2.4.3/altair_4.0.11_x64_win.exe'
$fileLocation = Join-Path $toolsDir '..\..\packages\altair-electron\out\altair_4.0.11_x64_win.exe'
$packageArgs = @{
  packageName   = $env:ChocolateyPackageName
  unzipLocation = $toolsDir
  fileType      = 'EXE'
  file          = $fileLocation
  file64        = $fileLocation
  # url           = $url
  # url64bit      = $url64
  softwareName  = 'altair-graphql*'
  checksum      = '' # TODO: Figure this out
  checksumType  = 'sha256'
  checksum64    = '' # TODO: Figure this out
  checksumType64= 'sha256'
  silentArgs    = "/qn /norestart /l*v `"$($env:TEMP)\$($packageName).$($env:chocolateyPackageVersion).MsiInstall.log`""
  validExitCodes= @(0, 3010, 1641)
}

Install-ChocolateyPackage @packageArgs
