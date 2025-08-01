# These Pester tests are for the for parameter-* and ex-path* snippets.
# Take a look at the .vscode\tasks.json file to see how you can create
# and configure a test task runner that will run all the Pester tests
# in your workspace folder.

# To run these Pester tests, press Ctrl+Shift+T or press Ctrl+Shift+P,
# type "test" and select "Tasks: Run Test Task".  This will invoke the
# test task runner defined in .vscode\tasks.json.

# This (empty) file is required by some of the tests.

BeforeAll {
    $null = New-Item -Path "$PSScriptRoot\foo[1].txt" -Force

    Import-Module $PSScriptRoot\..\SampleModule.psd1
    
    $WorkspaceRoot = Convert-Path $PSScriptRoot/..
    Set-Location $WorkspaceRoot
}

Describe 'Verify Path Processing for Non-existing Paths Allowed Impl' {
    It 'Processes non-wildcard absolute path to non-existing file via -Path param' {
        New-File -Path $WorkspaceRoot\ReadmeNew.md | Should -Be "$WorkspaceRoot\READMENew.md"
    }
    It 'Processes multiple absolute paths via -Path param' {
        New-File -Path $WorkspaceRoot\Readme.md, $WorkspaceRoot\XYZZY.ps1 |
            Should -Be @("$WorkspaceRoot\README.md", "$WorkspaceRoot\XYZZY.ps1")
    }
    It 'Processes relative path via -Path param' {
        New-File -Path ..\Examples\READMENew.md | Should -Be "$WorkspaceRoot\READMENew.md"
    }
    It 'Processes multiple relative path via -Path param' {
        New-File -Path ..\Examples\README.md, XYZZY.ps1 |
            Should -Be @("$WorkspaceRoot\README.md", "$WorkspaceRoot\XYZZY.ps1")
    }

    It 'Should accept pipeline input to Path' {
        Get-ChildItem -LiteralPath "$WorkspaceRoot\Tests\foo[1].txt" | New-File | Should -Be "$PSScriptRoot\foo[1].txt"
    }
}

Describe 'Verify Path Processing for NO Wildcards Allowed Impl' {
    It 'Processes non-wildcard absolute path via -Path param' {
        Import-FileNoWildcard -Path $WorkspaceRoot\Readme.md | Should -Be "$WorkspaceRoot\README.md"
    }
    It 'Processes multiple absolute paths via -Path param' {
        Import-FileNoWildcard -Path $WorkspaceRoot\Readme.md, $WorkspaceRoot\PathProcessingWildcards.ps1 |
            Should -Be @("$WorkspaceRoot\README.md", "$WorkspaceRoot\PathProcessingWildcards.ps1")
    }
    It 'Processes relative path via -Path param' {
        Import-FileNoWildcard -Path ..\examples\README.md | Should -Be "$WorkspaceRoot\README.md"
    }
    It 'Processes multiple relative path via -Path param' {
        Import-FileNoWildcard -Path ..\examples\README.md, .vscode\launch.json |
            Should -Be @("$WorkspaceRoot\README.md", "$WorkspaceRoot\.vscode\launch.json")
    }

    It 'Should accept pipeline input to Path' {
        Get-ChildItem -LiteralPath "$WorkspaceRoot\Tests\foo[1].txt" | Import-FileNoWildcard | Should -Be "$PSScriptRoot\foo[1].txt"
    }
}

Describe 'Verify Path Processing for Wildcards Allowed Impl' {
    It 'Processes non-wildcard absolute path via -Path param' {
        Import-FileWildcard -Path $WorkspaceRoot\Readme.md | Should -Be "$WorkspaceRoot\README.md"
    }
    It 'Processes multiple absolute paths via -Path param' {
        Import-FileWildcard -Path $WorkspaceRoot\Readme.md, $WorkspaceRoot\PathProcessingWildcards.ps1 |
            Should -Be @("$WorkspaceRoot\README.md", "$WorkspaceRoot\PathProcessingWildcards.ps1")
    }
    It 'Processes wildcard absolute path via -Path param' {
        $files = Import-FileWildcard -Path $WorkspaceRoot\*.psd1
        $files.Count | Should -Be 2
        $files[0] | Should -Be "$WorkspaceRoot\PSScriptAnalyzerSettings.psd1"
        $files[1] | Should -Be "$WorkspaceRoot\SampleModule.psd1"
    }
    It 'Processes wildcard relative path via -Path param' {
        $files = Import-FileWildcard -Path *.psd1
        $files.Count | Should -Be 2
        $files[0] | Should -Be "$WorkspaceRoot\PSScriptAnalyzerSettings.psd1"
        $files[1] | Should -Be "$WorkspaceRoot\SampleModule.psd1"
    }
    It 'Processes relative path via -Path param' {
        Import-FileWildcard -Path ..\examples\README.md | Should -Be "$WorkspaceRoot\README.md"
    }
    It 'Processes multiple relative path via -Path param' {
        Import-FileWildcard -Path ..\examples\README.md, .vscode\launch.json |
            Should -Be @("$WorkspaceRoot\README.md", "$WorkspaceRoot\.vscode\launch.json")
    }

    It 'DefaultParameterSet should -be Path' {
        $files = Import-FileWildcard *.psd1
        $files.Count | Should -Be 2
        $files[0] | Should -Be "$WorkspaceRoot\PSScriptAnalyzerSettings.psd1"
        $files[1] | Should -Be "$WorkspaceRoot\SampleModule.psd1"
    }

    It 'Should process absolute literal paths via -LiteralPath param'{
        Import-FileWildcard -LiteralPath "$PSScriptRoot\foo[1].txt" | Should -Be "$PSScriptRoot\foo[1].txt"
    }
    It 'Should process relative literal paths via -LiteralPath param'{
        Import-FileWildcard -LiteralPath "..\examples\Tests\foo[1].txt" | Should -Be "$PSScriptRoot\foo[1].txt"
    }
    It 'Should process multiple literal paths via -LiteralPath param'{
        Import-FileWildcard -LiteralPath "..\examples\Tests\foo[1].txt", "$WorkspaceRoot\README.md" |
            Should -Be @("$PSScriptRoot\foo[1].txt", "$WorkspaceRoot\README.md")
    }

    It 'Should accept pipeline input to LiteralPath' {
        Get-ChildItem -LiteralPath "$WorkspaceRoot\Tests\foo[1].txt" | Import-FileWildcard | Should -Be "$PSScriptRoot\foo[1].txt"
    }
}

# SIG # Begin signature block
# MIIoLQYJKoZIhvcNAQcCoIIoHjCCKBoCAQExDzANBglghkgBZQMEAgEFADB5Bgor
# BgEEAYI3AgEEoGswaTA0BgorBgEEAYI3AgEeMCYCAwEAAAQQH8w7YFlLCE63JNLG
# KX7zUQIBAAIBAAIBAAIBAAIBADAxMA0GCWCGSAFlAwQCAQUABCB6CJ52PZyVc3nS
# WZc7oVcIjrTVikue78YndkXZpkcvWKCCDXYwggX0MIID3KADAgECAhMzAAAEBGx0
# Bv9XKydyAAAAAAQEMA0GCSqGSIb3DQEBCwUAMH4xCzAJBgNVBAYTAlVTMRMwEQYD
# VQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNy
# b3NvZnQgQ29ycG9yYXRpb24xKDAmBgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25p
# bmcgUENBIDIwMTEwHhcNMjQwOTEyMjAxMTE0WhcNMjUwOTExMjAxMTE0WjB0MQsw
# CQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
# ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMR4wHAYDVQQDExVNaWNy
# b3NvZnQgQ29ycG9yYXRpb24wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIB
# AQC0KDfaY50MDqsEGdlIzDHBd6CqIMRQWW9Af1LHDDTuFjfDsvna0nEuDSYJmNyz
# NB10jpbg0lhvkT1AzfX2TLITSXwS8D+mBzGCWMM/wTpciWBV/pbjSazbzoKvRrNo
# DV/u9omOM2Eawyo5JJJdNkM2d8qzkQ0bRuRd4HarmGunSouyb9NY7egWN5E5lUc3
# a2AROzAdHdYpObpCOdeAY2P5XqtJkk79aROpzw16wCjdSn8qMzCBzR7rvH2WVkvF
# HLIxZQET1yhPb6lRmpgBQNnzidHV2Ocxjc8wNiIDzgbDkmlx54QPfw7RwQi8p1fy
# 4byhBrTjv568x8NGv3gwb0RbAgMBAAGjggFzMIIBbzAfBgNVHSUEGDAWBgorBgEE
# AYI3TAgBBggrBgEFBQcDAzAdBgNVHQ4EFgQU8huhNbETDU+ZWllL4DNMPCijEU4w
# RQYDVR0RBD4wPKQ6MDgxHjAcBgNVBAsTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEW
# MBQGA1UEBRMNMjMwMDEyKzUwMjkyMzAfBgNVHSMEGDAWgBRIbmTlUAXTgqoXNzci
# tW2oynUClTBUBgNVHR8ETTBLMEmgR6BFhkNodHRwOi8vd3d3Lm1pY3Jvc29mdC5j
# b20vcGtpb3BzL2NybC9NaWNDb2RTaWdQQ0EyMDExXzIwMTEtMDctMDguY3JsMGEG
# CCsGAQUFBwEBBFUwUzBRBggrBgEFBQcwAoZFaHR0cDovL3d3dy5taWNyb3NvZnQu
# Y29tL3BraW9wcy9jZXJ0cy9NaWNDb2RTaWdQQ0EyMDExXzIwMTEtMDctMDguY3J0
# MAwGA1UdEwEB/wQCMAAwDQYJKoZIhvcNAQELBQADggIBAIjmD9IpQVvfB1QehvpC
# Ge7QeTQkKQ7j3bmDMjwSqFL4ri6ae9IFTdpywn5smmtSIyKYDn3/nHtaEn0X1NBj
# L5oP0BjAy1sqxD+uy35B+V8wv5GrxhMDJP8l2QjLtH/UglSTIhLqyt8bUAqVfyfp
# h4COMRvwwjTvChtCnUXXACuCXYHWalOoc0OU2oGN+mPJIJJxaNQc1sjBsMbGIWv3
# cmgSHkCEmrMv7yaidpePt6V+yPMik+eXw3IfZ5eNOiNgL1rZzgSJfTnvUqiaEQ0X
# dG1HbkDv9fv6CTq6m4Ty3IzLiwGSXYxRIXTxT4TYs5VxHy2uFjFXWVSL0J2ARTYL
# E4Oyl1wXDF1PX4bxg1yDMfKPHcE1Ijic5lx1KdK1SkaEJdto4hd++05J9Bf9TAmi
# u6EK6C9Oe5vRadroJCK26uCUI4zIjL/qG7mswW+qT0CW0gnR9JHkXCWNbo8ccMk1
# sJatmRoSAifbgzaYbUz8+lv+IXy5GFuAmLnNbGjacB3IMGpa+lbFgih57/fIhamq
# 5VhxgaEmn/UjWyr+cPiAFWuTVIpfsOjbEAww75wURNM1Imp9NJKye1O24EspEHmb
# DmqCUcq7NqkOKIG4PVm3hDDED/WQpzJDkvu4FrIbvyTGVU01vKsg4UfcdiZ0fQ+/
# V0hf8yrtq9CkB8iIuk5bBxuPMIIHejCCBWKgAwIBAgIKYQ6Q0gAAAAAAAzANBgkq
# hkiG9w0BAQsFADCBiDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
# EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
# bjEyMDAGA1UEAxMpTWljcm9zb2Z0IFJvb3QgQ2VydGlmaWNhdGUgQXV0aG9yaXR5
# IDIwMTEwHhcNMTEwNzA4MjA1OTA5WhcNMjYwNzA4MjEwOTA5WjB+MQswCQYDVQQG
# EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwG
# A1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSgwJgYDVQQDEx9NaWNyb3NvZnQg
# Q29kZSBTaWduaW5nIFBDQSAyMDExMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIIC
# CgKCAgEAq/D6chAcLq3YbqqCEE00uvK2WCGfQhsqa+laUKq4BjgaBEm6f8MMHt03
# a8YS2AvwOMKZBrDIOdUBFDFC04kNeWSHfpRgJGyvnkmc6Whe0t+bU7IKLMOv2akr
# rnoJr9eWWcpgGgXpZnboMlImEi/nqwhQz7NEt13YxC4Ddato88tt8zpcoRb0Rrrg
# OGSsbmQ1eKagYw8t00CT+OPeBw3VXHmlSSnnDb6gE3e+lD3v++MrWhAfTVYoonpy
# 4BI6t0le2O3tQ5GD2Xuye4Yb2T6xjF3oiU+EGvKhL1nkkDstrjNYxbc+/jLTswM9
# sbKvkjh+0p2ALPVOVpEhNSXDOW5kf1O6nA+tGSOEy/S6A4aN91/w0FK/jJSHvMAh
# dCVfGCi2zCcoOCWYOUo2z3yxkq4cI6epZuxhH2rhKEmdX4jiJV3TIUs+UsS1Vz8k
# A/DRelsv1SPjcF0PUUZ3s/gA4bysAoJf28AVs70b1FVL5zmhD+kjSbwYuER8ReTB
# w3J64HLnJN+/RpnF78IcV9uDjexNSTCnq47f7Fufr/zdsGbiwZeBe+3W7UvnSSmn
# Eyimp31ngOaKYnhfsi+E11ecXL93KCjx7W3DKI8sj0A3T8HhhUSJxAlMxdSlQy90
# lfdu+HggWCwTXWCVmj5PM4TasIgX3p5O9JawvEagbJjS4NaIjAsCAwEAAaOCAe0w
# ggHpMBAGCSsGAQQBgjcVAQQDAgEAMB0GA1UdDgQWBBRIbmTlUAXTgqoXNzcitW2o
# ynUClTAZBgkrBgEEAYI3FAIEDB4KAFMAdQBiAEMAQTALBgNVHQ8EBAMCAYYwDwYD
# VR0TAQH/BAUwAwEB/zAfBgNVHSMEGDAWgBRyLToCMZBDuRQFTuHqp8cx0SOJNDBa
# BgNVHR8EUzBRME+gTaBLhklodHRwOi8vY3JsLm1pY3Jvc29mdC5jb20vcGtpL2Ny
# bC9wcm9kdWN0cy9NaWNSb29DZXJBdXQyMDExXzIwMTFfMDNfMjIuY3JsMF4GCCsG
# AQUFBwEBBFIwUDBOBggrBgEFBQcwAoZCaHR0cDovL3d3dy5taWNyb3NvZnQuY29t
# L3BraS9jZXJ0cy9NaWNSb29DZXJBdXQyMDExXzIwMTFfMDNfMjIuY3J0MIGfBgNV
# HSAEgZcwgZQwgZEGCSsGAQQBgjcuAzCBgzA/BggrBgEFBQcCARYzaHR0cDovL3d3
# dy5taWNyb3NvZnQuY29tL3BraW9wcy9kb2NzL3ByaW1hcnljcHMuaHRtMEAGCCsG
# AQUFBwICMDQeMiAdAEwAZQBnAGEAbABfAHAAbwBsAGkAYwB5AF8AcwB0AGEAdABl
# AG0AZQBuAHQALiAdMA0GCSqGSIb3DQEBCwUAA4ICAQBn8oalmOBUeRou09h0ZyKb
# C5YR4WOSmUKWfdJ5DJDBZV8uLD74w3LRbYP+vj/oCso7v0epo/Np22O/IjWll11l
# hJB9i0ZQVdgMknzSGksc8zxCi1LQsP1r4z4HLimb5j0bpdS1HXeUOeLpZMlEPXh6
# I/MTfaaQdION9MsmAkYqwooQu6SpBQyb7Wj6aC6VoCo/KmtYSWMfCWluWpiW5IP0
# wI/zRive/DvQvTXvbiWu5a8n7dDd8w6vmSiXmE0OPQvyCInWH8MyGOLwxS3OW560
# STkKxgrCxq2u5bLZ2xWIUUVYODJxJxp/sfQn+N4sOiBpmLJZiWhub6e3dMNABQam
# ASooPoI/E01mC8CzTfXhj38cbxV9Rad25UAqZaPDXVJihsMdYzaXht/a8/jyFqGa
# J+HNpZfQ7l1jQeNbB5yHPgZ3BtEGsXUfFL5hYbXw3MYbBL7fQccOKO7eZS/sl/ah
# XJbYANahRr1Z85elCUtIEJmAH9AAKcWxm6U/RXceNcbSoqKfenoi+kiVH6v7RyOA
# 9Z74v2u3S5fi63V4GuzqN5l5GEv/1rMjaHXmr/r8i+sLgOppO6/8MO0ETI7f33Vt
# Y5E90Z1WTk+/gFcioXgRMiF670EKsT/7qMykXcGhiJtXcVZOSEXAQsmbdlsKgEhr
# /Xmfwb1tbWrJUnMTDXpQzTGCGg0wghoJAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMw
# EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVN
# aWNyb3NvZnQgQ29ycG9yYXRpb24xKDAmBgNVBAMTH01pY3Jvc29mdCBDb2RlIFNp
# Z25pbmcgUENBIDIwMTECEzMAAAQEbHQG/1crJ3IAAAAABAQwDQYJYIZIAWUDBAIB
# BQCgga4wGQYJKoZIhvcNAQkDMQwGCisGAQQBgjcCAQQwHAYKKwYBBAGCNwIBCzEO
# MAwGCisGAQQBgjcCARUwLwYJKoZIhvcNAQkEMSIEIA34j16mQMDE/3dUVv34Y/zx
# NAz5iNAcGBFDac87Z+daMEIGCisGAQQBgjcCAQwxNDAyoBSAEgBNAGkAYwByAG8A
# cwBvAGYAdKEagBhodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20wDQYJKoZIhvcNAQEB
# BQAEggEAqq40Hk9VE9kRE671IGLU3LQfOM72zVEmhP/h82JZsQ16hslk0213u/tz
# f49qBUGYwL1IPNhfIotoAA4f1bxB79+nlwqs+Sz04W11maD+tnLa7TFWYHPiDR3C
# asv2mTAnHYc2VP2y6PqYE494jT0VRNtCDOK4xblXQRURJhOew1nL9ctIE9m0Tz+l
# 5brAB9tjx8kQagETow1MJyn5Q5LeoR1mVOZMqAW6+12XK3ZaKaZwoywpj1p90E8B
# VVCWN7o5bsOAXaKx2inNuI3zPX4JuOgKgpqWN9XMS9ZayizcfcjWAvTqZ4Jz3SfD
# ysg5HqTFUR8Growfr7l0Coc/hHDgB6GCF5cwgheTBgorBgEEAYI3AwMBMYIXgzCC
# F38GCSqGSIb3DQEHAqCCF3AwghdsAgEDMQ8wDQYJYIZIAWUDBAIBBQAwggFSBgsq
# hkiG9w0BCRABBKCCAUEEggE9MIIBOQIBAQYKKwYBBAGEWQoDATAxMA0GCWCGSAFl
# AwQCAQUABCDz3XBqMHGtTHql4iQMNy+m9oKWf4tRKk3lVOHu82uz1gIGaEtA1bAQ
# GBMyMDI1MDYzMDIxMDUyOS4xMThaMASAAgH0oIHRpIHOMIHLMQswCQYDVQQGEwJV
# UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
# ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSUwIwYDVQQLExxNaWNyb3NvZnQgQW1l
# cmljYSBPcGVyYXRpb25zMScwJQYDVQQLEx5uU2hpZWxkIFRTUyBFU046RjAwMi0w
# NUUwLUQ5NDcxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZpY2Wg
# ghHtMIIHIDCCBQigAwIBAgITMwAAAgU8dWyCRIfN/gABAAACBTANBgkqhkiG9w0B
# AQsFADB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
# BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYD
# VQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDAeFw0yNTAxMzAxOTQy
# NDlaFw0yNjA0MjIxOTQyNDlaMIHLMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
# aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
# cnBvcmF0aW9uMSUwIwYDVQQLExxNaWNyb3NvZnQgQW1lcmljYSBPcGVyYXRpb25z
# MScwJQYDVQQLEx5uU2hpZWxkIFRTUyBFU046RjAwMi0wNUUwLUQ5NDcxJTAjBgNV
# BAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZpY2UwggIiMA0GCSqGSIb3DQEB
# AQUAA4ICDwAwggIKAoICAQCSkvLfd7gF1r2wGdy85CFYXHUC8ywEyD4LRLv0WYEX
# eeZ0u5YuK7p2cXVzQmZPOHTN8TWqG2SPlUb+7PldzFDDAlR3vU8piOjmhu9rHW43
# M2dbor9jl9gluhzwUd2SciVGa7f9t67tM3KFKRSMXFtHKF3KwBB7aVo+b1qy5p9D
# Wlo2N5FGrBqHMEVlNyzreHYoDLL+m8fSsqMu/iYUqxzK5F4S7IY5NemAB8B+A3Qg
# wVIi64KJIfeKZUeiWKCTf4odUgP3AQilxh48P6z7AT4IA0dMEtKhYLFs4W/KNDMs
# Yr7KpQPKVCcC5E8uDHdKewubyzenkTxy4ff1N3g8yho5Pi9BfjR0VytrkmpDfep8
# JPwcb4BNOIXOo1pfdHZ8EvnR7JFZFQiqpMZFlO5CAuTYH8ujc5PUHlaMAJ8NEa9T
# FJTOSBrB7PRgeh/6NJ2xu9yxPh/kVN9BGss93MC6UjpoxeM4x70bwbwiK8SNHIO8
# D8cql7VSevUYbjN4NogFFwhBClhodE/zeGPq6y6ixD4z65IHY3zwFQbBVX/w+L/V
# HNn/BMGs2PGHnlRjO/Kk8NIpN4shkFQqA1fM08frrDSNEY9VKDtpsUpAF51Y1oQ6
# tJhWM1d3neCXh6b/6N+XeHORCwnY83K+pFMMhg8isXQb6KRl65kg8XYBd4JwkbKo
# VQIDAQABo4IBSTCCAUUwHQYDVR0OBBYEFHR6Wrs27b6+yJ3bEZ9o5NdL1bLwMB8G
# A1UdIwQYMBaAFJ+nFV0AXmJdg/Tl0mWnG1M1GelyMF8GA1UdHwRYMFYwVKBSoFCG
# Tmh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvY3JsL01pY3Jvc29mdCUy
# MFRpbWUtU3RhbXAlMjBQQ0ElMjAyMDEwKDEpLmNybDBsBggrBgEFBQcBAQRgMF4w
# XAYIKwYBBQUHMAKGUGh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvY2Vy
# dHMvTWljcm9zb2Z0JTIwVGltZS1TdGFtcCUyMFBDQSUyMDIwMTAoMSkuY3J0MAwG
# A1UdEwEB/wQCMAAwFgYDVR0lAQH/BAwwCgYIKwYBBQUHAwgwDgYDVR0PAQH/BAQD
# AgeAMA0GCSqGSIb3DQEBCwUAA4ICAQAOuxk47b1i75V81Tx6xo10xNIr4zZxYVfk
# F5TFq2kndPHgzVyLnssw/HKkEZRCgZVpkKEJ6Y4jvG5tugMi+Wjt7hUMSipk+RpB
# 5gFQvh1xmAEL2flegzTWEsnj0wrESplI5Z3vgf2eGXAr/RcqGjSpouHbD2HY9Y3F
# 0Ol6FRDCV/HEGKRHzn2M5rQpFGSjacT4DkqVYmem/ArOfSvVojnKEIW914UxGtuh
# JSr9jOo5RqTX7GIqbtvN7zhWld+i3XxdhdNcflQz9YhoFqQexBenoIRgAPAtwH68
# xczr9LMC3l9ALEpnsvO0RiKPXF4l22/OfcFffaphnl/TDwkiJfxOyAMfUF3xI9+3
# izT1WX2CFs2RaOAq3dcohyJw+xRG0E8wkCHqkV57BbUBEzLX8L9lGJ1DoxYNpoDX
# 7iQzJ9Qdkypi5fv773E3Ch8A+toxeFp6FifQZyCc8IcIBlHyak6MbT6YTVQNgQ/h
# 8FF+S5OqP7CECFvIH2Kt2P0GlOu9C0BfashnTjodmtZFZsptUvirk/2HOLLjBiMj
# DwJsQAFAzJuz4ZtTyorrvER10Gl/mbmViHqhvNACfTzPiLfjDgyvp9s7/bHu/Cal
# KmeiJULGjh/lwAj5319pggsGJqbhJ4FbFc+oU5zffbm/rKjVZ8kxND3im10Qp41n
# 2t/qpyP6ETCCB3EwggVZoAMCAQICEzMAAAAVxedrngKbSZkAAAAAABUwDQYJKoZI
# hvcNAQELBQAwgYgxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAw
# DgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24x
# MjAwBgNVBAMTKU1pY3Jvc29mdCBSb290IENlcnRpZmljYXRlIEF1dGhvcml0eSAy
# MDEwMB4XDTIxMDkzMDE4MjIyNVoXDTMwMDkzMDE4MzIyNVowfDELMAkGA1UEBhMC
# VVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNV
# BAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRp
# bWUtU3RhbXAgUENBIDIwMTAwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoIC
# AQDk4aZM57RyIQt5osvXJHm9DtWC0/3unAcH0qlsTnXIyjVX9gF/bErg4r25Phdg
# M/9cT8dm95VTcVrifkpa/rg2Z4VGIwy1jRPPdzLAEBjoYH1qUoNEt6aORmsHFPPF
# dvWGUNzBRMhxXFExN6AKOG6N7dcP2CZTfDlhAnrEqv1yaa8dq6z2Nr41JmTamDu6
# GnszrYBbfowQHJ1S/rboYiXcag/PXfT+jlPP1uyFVk3v3byNpOORj7I5LFGc6XBp
# Dco2LXCOMcg1KL3jtIckw+DJj361VI/c+gVVmG1oO5pGve2krnopN6zL64NF50Zu
# yjLVwIYwXE8s4mKyzbnijYjklqwBSru+cakXW2dg3viSkR4dPf0gz3N9QZpGdc3E
# XzTdEonW/aUgfX782Z5F37ZyL9t9X4C626p+Nuw2TPYrbqgSUei/BQOj0XOmTTd0
# lBw0gg/wEPK3Rxjtp+iZfD9M269ewvPV2HM9Q07BMzlMjgK8QmguEOqEUUbi0b1q
# GFphAXPKZ6Je1yh2AuIzGHLXpyDwwvoSCtdjbwzJNmSLW6CmgyFdXzB0kZSU2LlQ
# +QuJYfM2BjUYhEfb3BvR/bLUHMVr9lxSUV0S2yW6r1AFemzFER1y7435UsSFF5PA
# PBXbGjfHCBUYP3irRbb1Hode2o+eFnJpxq57t7c+auIurQIDAQABo4IB3TCCAdkw
# EgYJKwYBBAGCNxUBBAUCAwEAATAjBgkrBgEEAYI3FQIEFgQUKqdS/mTEmr6CkTxG
# NSnPEP8vBO4wHQYDVR0OBBYEFJ+nFV0AXmJdg/Tl0mWnG1M1GelyMFwGA1UdIARV
# MFMwUQYMKwYBBAGCN0yDfQEBMEEwPwYIKwYBBQUHAgEWM2h0dHA6Ly93d3cubWlj
# cm9zb2Z0LmNvbS9wa2lvcHMvRG9jcy9SZXBvc2l0b3J5Lmh0bTATBgNVHSUEDDAK
# BggrBgEFBQcDCDAZBgkrBgEEAYI3FAIEDB4KAFMAdQBiAEMAQTALBgNVHQ8EBAMC
# AYYwDwYDVR0TAQH/BAUwAwEB/zAfBgNVHSMEGDAWgBTV9lbLj+iiXGJo0T2UkFvX
# zpoYxDBWBgNVHR8ETzBNMEugSaBHhkVodHRwOi8vY3JsLm1pY3Jvc29mdC5jb20v
# cGtpL2NybC9wcm9kdWN0cy9NaWNSb29DZXJBdXRfMjAxMC0wNi0yMy5jcmwwWgYI
# KwYBBQUHAQEETjBMMEoGCCsGAQUFBzAChj5odHRwOi8vd3d3Lm1pY3Jvc29mdC5j
# b20vcGtpL2NlcnRzL01pY1Jvb0NlckF1dF8yMDEwLTA2LTIzLmNydDANBgkqhkiG
# 9w0BAQsFAAOCAgEAnVV9/Cqt4SwfZwExJFvhnnJL/Klv6lwUtj5OR2R4sQaTlz0x
# M7U518JxNj/aZGx80HU5bbsPMeTCj/ts0aGUGCLu6WZnOlNN3Zi6th542DYunKmC
# VgADsAW+iehp4LoJ7nvfam++Kctu2D9IdQHZGN5tggz1bSNU5HhTdSRXud2f8449
# xvNo32X2pFaq95W2KFUn0CS9QKC/GbYSEhFdPSfgQJY4rPf5KYnDvBewVIVCs/wM
# nosZiefwC2qBwoEZQhlSdYo2wh3DYXMuLGt7bj8sCXgU6ZGyqVvfSaN0DLzskYDS
# PeZKPmY7T7uG+jIa2Zb0j/aRAfbOxnT99kxybxCrdTDFNLB62FD+CljdQDzHVG2d
# Y3RILLFORy3BFARxv2T5JL5zbcqOCb2zAVdJVGTZc9d/HltEAY5aGZFrDZ+kKNxn
# GSgkujhLmm77IVRrakURR6nxt67I6IleT53S0Ex2tVdUCbFpAUR+fKFhbHP+Crvs
# QWY9af3LwUFJfn6Tvsv4O+S3Fb+0zj6lMVGEvL8CwYKiexcdFYmNcP7ntdAoGokL
# jzbaukz5m/8K6TT4JDVnK+ANuOaMmdbhIurwJ0I9JZTmdHRbatGePu1+oDEzfbzL
# 6Xu/OHBE0ZDxyKs6ijoIYn/ZcGNTTY3ugm2lBRDBcQZqELQdVTNYs6FwZvKhggNQ
# MIICOAIBATCB+aGB0aSBzjCByzELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hp
# bmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jw
# b3JhdGlvbjElMCMGA1UECxMcTWljcm9zb2Z0IEFtZXJpY2EgT3BlcmF0aW9uczEn
# MCUGA1UECxMeblNoaWVsZCBUU1MgRVNOOkYwMDItMDVFMC1EOTQ3MSUwIwYDVQQD
# ExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2aWNloiMKAQEwBwYFKw4DAhoDFQDV
# sH9p1tJn+krwCMvqOhVvXrbetKCBgzCBgKR+MHwxCzAJBgNVBAYTAlVTMRMwEQYD
# VQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNy
# b3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1w
# IFBDQSAyMDEwMA0GCSqGSIb3DQEBCwUAAgUA7A14zDAiGA8yMDI1MDYzMDIwNTc0
# OFoYDzIwMjUwNzAxMjA1NzQ4WjB3MD0GCisGAQQBhFkKBAExLzAtMAoCBQDsDXjM
# AgEAMAoCAQACAiC6AgH/MAcCAQACAhRSMAoCBQDsDspMAgEAMDYGCisGAQQBhFkK
# BAIxKDAmMAwGCisGAQQBhFkKAwKgCjAIAgEAAgMHoSChCjAIAgEAAgMBhqAwDQYJ
# KoZIhvcNAQELBQADggEBADmi12Pwb0qm1PJTCT7LHaHI+CYT7RF8uRZHoVBX7YRw
# UWFf6bT42+jXILyfeUXLFDfPwCNm3PDumPFR4HPq0MBvxWtiLot65X/2zTMiHHt2
# OOT6Adk/TDELDJ2lGMHtbelzxyRjRla2tSxHGSo8RGX9q1G3H14JT3kJfAmq5UqR
# oQWOoXQdu/4Y/EKRKIX7jBaHvzGkBIp9U+MbqJwVUKa1BKlrnTxc5mHiOlJQ6t1d
# HYHv+x7UAxPEwZz5M9E11LCOhOy7v39o1+/12oxOKuPa7GbOxZHMOPPvtnfyTT6i
# E3CzVV4OzJ4ntqT3JStC7NFhOpDZgubijGHlfqP7utkxggQNMIIECQIBATCBkzB8
# MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVk
# bW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
# aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMAITMwAAAgU8dWyCRIfN/gABAAAC
# BTANBglghkgBZQMEAgEFAKCCAUowGgYJKoZIhvcNAQkDMQ0GCyqGSIb3DQEJEAEE
# MC8GCSqGSIb3DQEJBDEiBCAqCEV1nIo2gpueenOhqrzEpI/gMNjQFxL3tAB2nSzk
# KjCB+gYLKoZIhvcNAQkQAi8xgeowgecwgeQwgb0EIIANAz3ceY0umhdWLR2sJpq0
# OPqtJDTAYRmjHVkwEW9IMIGYMIGApH4wfDELMAkGA1UEBhMCVVMxEzARBgNVBAgT
# Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
# dCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENB
# IDIwMTACEzMAAAIFPHVsgkSHzf4AAQAAAgUwIgQgTn9NJAVfg96fZpkmBdEobCrX
# V/frzloxx0jPViZ90cYwDQYJKoZIhvcNAQELBQAEggIAVQpAJGRSVlF2Uprqzv6t
# OCCX5r0CKiCDdS+PuzySvo3foCAhP3ioPfTDJNHBEEwewKSqAe4LgwOwZOh27q7M
# 83HYln5DuNG5fvTDexrYmbQnOmzAp5CWoz8g/ZraYbdMFSEKnmP1DNbJ6PPEHnAE
# lf6an4mkdKhvNMVjL0z392ezOFHFnQodFc4E2rzWH9KD2fHo8oH6kYuKjy8PW5Jb
# +e8DbfCkL/Doy3Qy+z+OMgpuF286QUuaydFdgLCHM5NEsgp9sUsF486sq8sV66Z+
# VYCUrI6b8P1sKQd84u7aDw+3pbHwsPGnYDEz6QdaDiGmTe9N/TEysTCBlnb50WQh
# ULL+dXcM6ZVpIC0R4bRgh0y1233SdInHBI1SiPpRaL9G2c7g+oWqEj1U6KAuALko
# HjYXozUX+/ePgONs28yaVdhlOh9Iu60Ad7sRFb2ZXqfAypKgEJ/kYwarnzWo+rK/
# 9OXztghroIcWHjPaKBOJJ5406eBuJWoAIrpYGF60CdLNZo9Hj/8XyMoz1h/a9GDB
# IOMUPjvqh4ZrT375TyJWCUCatBZZ3FbhhpDZDIAqw44miM+YhN25TCjiLJmL2t0l
# dboyf91Wxb0ClY50COF8PsmYRtlLICVxt0X095E7BuASSfMJGKbo8kZLZfRQbKj3
# tTGplpTYuWBoGFheWwMWtMg=
# SIG # End signature block
