import { useState, useMemo } from 'react';
import ContextMenu from '../../components/ContextMenu/ContextMenu';
import './RegistryEditor.css';

interface RegKey { name: string; children?: RegKey[]; values?: RegValue[]; }
interface RegValue { name: string; type: 'REG_SZ' | 'REG_DWORD' | 'REG_BINARY' | 'REG_EXPAND_SZ' | 'REG_MULTI_SZ' | 'REG_QWORD'; data: string; }

const REGISTRY: RegKey[] = [
  {
    name: 'HKEY_CLASSES_ROOT', children: [
      { name: '.txt', values: [{ name: '(Default)', type: 'REG_SZ', data: 'txtfile' }, { name: 'Content Type', type: 'REG_SZ', data: 'text/plain' }] },
      { name: '.html', values: [{ name: '(Default)', type: 'REG_SZ', data: 'htmlfile' }, { name: 'Content Type', type: 'REG_SZ', data: 'text/html' }] },
      { name: '.exe', values: [{ name: '(Default)', type: 'REG_SZ', data: 'exefile' }] },
      { name: '.dll', values: [{ name: '(Default)', type: 'REG_SZ', data: 'dllfile' }] },
      { name: '.mp4', values: [{ name: '(Default)', type: 'REG_SZ', data: 'VLC.mp4' }, { name: 'Content Type', type: 'REG_SZ', data: 'video/mp4' }] },
      { name: '.mkv', values: [{ name: '(Default)', type: 'REG_SZ', data: 'VLC.mkv' }, { name: 'Content Type', type: 'REG_SZ', data: 'video/x-matroska' }] },
      { name: '.mp3', values: [{ name: '(Default)', type: 'REG_SZ', data: 'VLC.mp3' }, { name: 'Content Type', type: 'REG_SZ', data: 'audio/mpeg' }] },
      { name: '.flac', values: [{ name: '(Default)', type: 'REG_SZ', data: 'VLC.flac' }, { name: 'Content Type', type: 'REG_SZ', data: 'audio/flac' }] },
      { name: '.pdf', values: [{ name: '(Default)', type: 'REG_SZ', data: 'AcroExch.Document.DC' }, { name: 'Content Type', type: 'REG_SZ', data: 'application/pdf' }] },
      { name: '.png', values: [{ name: '(Default)', type: 'REG_SZ', data: 'pngfile' }, { name: 'Content Type', type: 'REG_SZ', data: 'image/png' }] },
      { name: '.jpg', values: [{ name: '(Default)', type: 'REG_SZ', data: 'jpegfile' }, { name: 'Content Type', type: 'REG_SZ', data: 'image/jpeg' }] },
      { name: '.zip', values: [{ name: '(Default)', type: 'REG_SZ', data: 'CompressedFolder' }] },
      { name: '.py', values: [{ name: '(Default)', type: 'REG_SZ', data: 'Python.File' }, { name: 'Content Type', type: 'REG_SZ', data: 'text/plain' }] },
      { name: '.js', values: [{ name: '(Default)', type: 'REG_SZ', data: 'JSFile' }, { name: 'Content Type', type: 'REG_SZ', data: 'text/javascript' }] },
      { name: '.ts', values: [{ name: '(Default)', type: 'REG_SZ', data: 'TypeScriptFile' }, { name: 'Content Type', type: 'REG_SZ', data: 'text/typescript' }] },
      { name: '.json', values: [{ name: '(Default)', type: 'REG_SZ', data: 'JSONFile' }, { name: 'Content Type', type: 'REG_SZ', data: 'application/json' }] },
      { name: 'Directory', children: [
        { name: 'shell', children: [
          { name: 'open', values: [{ name: 'command', type: 'REG_SZ', data: 'explorer.exe "%1"' }] },
          { name: 'explore', values: [{ name: 'command', type: 'REG_SZ', data: 'explorer.exe /e,"%1"' }] },
          { name: 'cmd', values: [{ name: '(Default)', type: 'REG_SZ', data: 'Open command window here' }, { name: 'command', type: 'REG_SZ', data: 'cmd.exe /s /k pushd "%V"' }] },
          { name: 'powershell', values: [{ name: '(Default)', type: 'REG_SZ', data: 'Open PowerShell window here' }, { name: 'command', type: 'REG_SZ', data: 'powershell.exe -noexit -command Set-Location -literalPath \'%V\'' }] },
        ]},
        { name: 'shellex', children: [
          { name: 'ContextMenuHandlers' },
          { name: 'PropertySheetHandlers' },
        ]},
      ]},
      { name: 'exefile', children: [
        { name: 'shell', children: [
          { name: 'open', values: [{ name: 'command', type: 'REG_SZ', data: '"%1" %*' }] },
          { name: 'runas', values: [{ name: '(Default)', type: 'REG_SZ', data: 'Run as &administrator' }, { name: 'command', type: 'REG_SZ', data: '"%1" %*' }] },
        ]},
      ]},
      { name: 'txtfile', children: [
        { name: 'shell', children: [
          { name: 'open', values: [{ name: 'command', type: 'REG_SZ', data: 'notepad.exe %1' }] },
          { name: 'print', values: [{ name: 'command', type: 'REG_SZ', data: 'notepad.exe /p %1' }] },
        ]},
      ]},
      { name: 'Applications', children: [
        { name: 'chrome.exe', children: [{ name: 'shell', children: [{ name: 'open', values: [{ name: 'command', type: 'REG_SZ', data: '"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" -- "%1"' }] }] }] },
        { name: 'msedge.exe', children: [{ name: 'shell', children: [{ name: 'open', values: [{ name: 'command', type: 'REG_SZ', data: '"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" -- "%1"' }] }] }] },
        { name: 'vlc.exe', children: [{ name: 'shell', children: [{ name: 'open', values: [{ name: 'command', type: 'REG_SZ', data: '"C:\\Program Files\\VideoLAN\\VLC\\vlc.exe" --one-instance %1' }] }] }] },
      ]},
    ],
  },
  {
    name: 'HKEY_CURRENT_USER', children: [
      { name: 'Software', children: [
        { name: 'Microsoft', children: [
          { name: 'Windows', children: [
            { name: 'CurrentVersion', children: [
              { name: 'Run', values: [
                { name: 'Discord', type: 'REG_SZ', data: 'C:\\Users\\User\\AppData\\Local\\Discord\\Update.exe --processStart Discord.exe' },
                { name: 'Spotify', type: 'REG_SZ', data: 'C:\\Users\\User\\AppData\\Roaming\\Spotify\\Spotify.exe' },
                { name: 'Steam', type: 'REG_SZ', data: '"C:\\Program Files (x86)\\Steam\\Steam.exe" -silent' },
                { name: 'OneDrive', type: 'REG_EXPAND_SZ', data: '"C:\\Program Files\\Microsoft OneDrive\\OneDrive.exe" /background' },
              ]},
              { name: 'RunOnce', values: [
                { name: '(Default)', type: 'REG_SZ', data: '(value not set)' },
              ]},
              { name: 'Explorer', children: [
                { name: 'Advanced', values: [
                  { name: 'Hidden', type: 'REG_DWORD', data: '0x00000001' },
                  { name: 'HideFileExt', type: 'REG_DWORD', data: '0x00000000' },
                  { name: 'ShowSuperHidden', type: 'REG_DWORD', data: '0x00000001' },
                  { name: 'LaunchTo', type: 'REG_DWORD', data: '0x00000001' },
                  { name: 'NavPaneExpandToCurrentFolder', type: 'REG_DWORD', data: '0x00000001' },
                ]},
                { name: 'Shell Folders', values: [
                  { name: 'Desktop', type: 'REG_EXPAND_SZ', data: '%USERPROFILE%\\Desktop' },
                  { name: 'Personal', type: 'REG_EXPAND_SZ', data: '%USERPROFILE%\\Documents' },
                  { name: 'My Pictures', type: 'REG_EXPAND_SZ', data: '%USERPROFILE%\\Pictures' },
                  { name: 'My Music', type: 'REG_EXPAND_SZ', data: '%USERPROFILE%\\Music' },
                  { name: 'My Video', type: 'REG_EXPAND_SZ', data: '%USERPROFILE%\\Videos' },
                ]},
                { name: 'RecentDocs', children: [
                  { name: '.txt', values: [{ name: '(Default)', type: 'REG_BINARY', data: '62 00 75 00 64 00 67 00 65 00 74 00 2E 00 74 00 78 00 74 00' }] },
                  { name: '.py', values: [{ name: '(Default)', type: 'REG_BINARY', data: '73 00 65 00 72 00 76 00 65 00 72 00 2E 00 70 00 79 00 00 00' }] },
                ]},
              ]},
              { name: 'Personalization', values: [
                { name: 'AppsUseLightTheme', type: 'REG_DWORD', data: '0x00000000' },
                { name: 'SystemUsesLightTheme', type: 'REG_DWORD', data: '0x00000000' },
                { name: 'ColorPrevalence', type: 'REG_DWORD', data: '0x00000000' },
                { name: 'AccentColor', type: 'REG_DWORD', data: '0xff4343ff' },
                { name: 'AccentColorInactive', type: 'REG_DWORD', data: '0xff9d9d9d' },
              ]},
              { name: 'Search', values: [
                { name: 'BingSearchEnabled', type: 'REG_DWORD', data: '0x00000000' },
                { name: 'CortanaEnabled', type: 'REG_DWORD', data: '0x00000000' },
                { name: 'SearchboxTaskbarMode', type: 'REG_DWORD', data: '0x00000001' },
              ]},
              { name: 'Privacy', values: [
                { name: 'TailoredExperiencesWithDiagnosticDataEnabled', type: 'REG_DWORD', data: '0x00000000' },
                { name: 'DevicePairStatus', type: 'REG_DWORD', data: '0x00000001' },
              ]},
              { name: 'GameDVR', values: [
                { name: 'AppCaptureEnabled', type: 'REG_DWORD', data: '0x00000001' },
                { name: 'AudioCaptureEnabled', type: 'REG_DWORD', data: '0x00000001' },
                { name: 'GameDVREnabled', type: 'REG_DWORD', data: '0x00000001' },
              ]},
            ]},
          ]},
          { name: 'Office', children: [
            { name: '16.0', children: [
              { name: 'Word', children: [
                { name: 'Options', values: [
                  { name: 'DefaultFormat', type: 'REG_SZ', data: '' },
                  { name: 'AutoSave', type: 'REG_DWORD', data: '0x00000001' },
                  { name: 'Autosave_Time', type: 'REG_DWORD', data: '0x0000000a' },
                  { name: 'SpellingErrorsHighlight', type: 'REG_DWORD', data: '0x00000001' },
                ]},
              ]},
              { name: 'Excel', children: [
                { name: 'Options', values: [
                  { name: 'DefaultSheets', type: 'REG_DWORD', data: '0x00000001' },
                  { name: 'AutoSave', type: 'REG_DWORD', data: '0x00000001' },
                  { name: 'StandardFont', type: 'REG_SZ', data: 'Calibri' },
                  { name: 'StandardFontSize', type: 'REG_DWORD', data: '0x0000000b' },
                ]},
              ]},
              { name: 'Outlook', children: [
                { name: 'Options', values: [
                  { name: 'AutoNameCheck', type: 'REG_DWORD', data: '0x00000001' },
                  { name: 'DeleteExpiredMeetingRequests', type: 'REG_DWORD', data: '0x00000001' },
                ]},
              ]},
            ]},
          ]},
          { name: 'Edge', children: [
            { name: 'Preferences', values: [
              { name: 'homepage', type: 'REG_SZ', data: 'https://www.bing.com' },
              { name: 'extensions_on_ntp', type: 'REG_DWORD', data: '0x00000001' },
            ]},
          ]},
          { name: 'Internet Explorer', children: [
            { name: 'Main', values: [
              { name: 'Start Page', type: 'REG_SZ', data: 'https://www.bing.com/' },
              { name: 'Search Page', type: 'REG_SZ', data: 'https://www.bing.com/search?q=%s' },
              { name: 'Use Search Asst', type: 'REG_SZ', data: 'no' },
            ]},
            { name: 'Privacy', values: [
              { name: 'BlockThirdPartyCookies', type: 'REG_DWORD', data: '0x00000001' },
            ]},
          ]},
          { name: 'OneDrive', values: [
            { name: 'DisablePersonalSync', type: 'REG_DWORD', data: '0x00000000' },
            { name: 'UserFolder', type: 'REG_SZ', data: 'C:\\Users\\User\\OneDrive' },
            { name: 'EnableSyncAdminReports', type: 'REG_DWORD', data: '0x00000000' },
          ]},
          { name: 'Visual Studio Code', children: [
            { name: 'InstallInfo', values: [
              { name: 'InstallLocation', type: 'REG_SZ', data: 'C:\\Users\\User\\AppData\\Local\\Programs\\Microsoft VS Code' },
              { name: 'Version', type: 'REG_SZ', data: '1.87.2' },
            ]},
          ]},
        ]},
        { name: 'Google', children: [
          { name: 'Chrome', children: [
            { name: 'PreferenceMACs', values: [
              { name: 'Super Mac', type: 'REG_SZ', data: '5B6BC32768B1D1A1564BFD57B43A6D8E5E1A7C6' },
            ]},
            { name: 'Policies', values: [
              { name: 'HomepageLocation', type: 'REG_SZ', data: 'https://www.google.com' },
              { name: 'DefaultSearchProviderEnabled', type: 'REG_DWORD', data: '0x00000001' },
            ]},
          ]},
        ]},
        { name: 'Valve', children: [
          { name: 'Steam', values: [
            { name: 'SteamPath', type: 'REG_SZ', data: 'c:\\program files (x86)\\steam' },
            { name: 'SteamExe', type: 'REG_SZ', data: 'c:\\program files (x86)\\steam\\steam.exe' },
            { name: 'AutoLoginUser', type: 'REG_SZ', data: 'User' },
            { name: 'RememberPassword', type: 'REG_DWORD', data: '0x00000001' },
            { name: 'Language', type: 'REG_SZ', data: 'english' },
            { name: 'RunningAppID', type: 'REG_DWORD', data: '0x000007A1' },
          ]},
        ]},
        { name: 'Discord Inc', children: [
          { name: 'Discord', values: [
            { name: 'InstallPath', type: 'REG_SZ', data: 'C:\\Users\\User\\AppData\\Local\\Discord' },
            { name: 'Version', type: 'REG_SZ', data: '1.0.9163' },
          ]},
        ]},
        { name: 'Spotify AB', children: [
          { name: 'Spotify', values: [
            { name: 'StartMenu', type: 'REG_DWORD', data: '0x00000001' },
            { name: 'Version', type: 'REG_SZ', data: '1.2.37.701' },
          ]},
        ]},
        { name: 'NVIDIA Corporation', children: [
          { name: 'Global', children: [
            { name: 'NGXCore', values: [
              { name: 'EnableOTA', type: 'REG_DWORD', data: '0x00000001' },
            ]},
            { name: 'GFExperience', values: [
              { name: 'CurGFEVersion', type: 'REG_SZ', data: '3.27.0.120' },
              { name: 'EnableShadows', type: 'REG_DWORD', data: '0x00000001' },
              { name: 'EnableShadowPlay', type: 'REG_DWORD', data: '0x00000001' },
            ]},
          ]},
        ]},
        { name: 'Python', children: [
          { name: 'PythonCore', children: [
            { name: '3.11', children: [
              { name: 'InstallPath', values: [
                { name: '(Default)', type: 'REG_SZ', data: 'C:\\Users\\User\\AppData\\Local\\Programs\\Python\\Python311\\' },
                { name: 'ExecutablePath', type: 'REG_SZ', data: 'C:\\Users\\User\\AppData\\Local\\Programs\\Python\\Python311\\python.exe' },
              ]},
              { name: 'PythonPath', values: [
                { name: '(Default)', type: 'REG_SZ', data: 'C:\\Users\\User\\AppData\\Local\\Programs\\Python\\Python311\\Lib;C:\\Users\\User\\AppData\\Local\\Programs\\Python\\Python311\\DLLs' },
              ]},
            ]},
          ]},
        ]},
      ]},
      { name: 'Environment', values: [
        { name: 'PATH', type: 'REG_EXPAND_SZ', data: '%USERPROFILE%\\AppData\\Local\\Microsoft\\WindowsApps;%USERPROFILE%\\AppData\\Local\\Programs\\Python\\Python311\\Scripts;%USERPROFILE%\\AppData\\Local\\Programs\\Python\\Python311;C:\\Program Files\\nodejs;' },
        { name: 'TEMP', type: 'REG_EXPAND_SZ', data: '%USERPROFILE%\\AppData\\Local\\Temp' },
        { name: 'TMP', type: 'REG_EXPAND_SZ', data: '%USERPROFILE%\\AppData\\Local\\Temp' },
        { name: 'PYTHONPATH', type: 'REG_SZ', data: 'C:\\Users\\User\\AppData\\Local\\Programs\\Python\\Python311\\Lib' },
        { name: 'NODE_PATH', type: 'REG_SZ', data: 'C:\\Program Files\\nodejs\\node_modules' },
      ]},
      { name: 'SessionInformation', values: [
        { name: 'ProgramCount', type: 'REG_DWORD', data: '0x00000017' },
      ]},
      { name: 'Network', children: [
        { name: 'V', children: [
          { name: 'N:', values: [
            { name: 'RemotePath', type: 'REG_SZ', data: '\\\\NAS-Synology\\Media' },
            { name: 'UserName', type: 'REG_SZ', data: 'User' },
            { name: 'ProviderName', type: 'REG_SZ', data: 'Microsoft Network' },
          ]},
          { name: 'Q:', values: [
            { name: 'RemotePath', type: 'REG_SZ', data: '\\\\NAS-Seeds1\\Seeds' },
            { name: 'UserName', type: 'REG_SZ', data: 'User' },
            { name: 'ProviderName', type: 'REG_SZ', data: 'Microsoft Network' },
          ]},
        ]},
      ]},
    ],
  },
  {
    name: 'HKEY_LOCAL_MACHINE', children: [
      { name: 'HARDWARE', children: [
        { name: 'DESCRIPTION', children: [
          { name: 'System', values: [
            { name: 'SystemBiosVersion', type: 'REG_MULTI_SZ', data: 'ASUS - 2703\nAmerican Megatrends Inc. - 2703\nRelease Date: 04/12/2023' },
            { name: 'VideoBiosVersion', type: 'REG_MULTI_SZ', data: 'NVIDIA GeForce RTX 4070\n95.00.48.00.11 02/23/2024' },
            { name: 'SystemBiosDate', type: 'REG_SZ', data: '04/12/23' },
          ]},
          { name: 'CentralProcessor', children: [
            { name: '0', values: [
              { name: 'ProcessorNameString', type: 'REG_SZ', data: '12th Gen Intel(R) Core(TM) i7-12700K' },
              { name: 'VendorIdentifier', type: 'REG_SZ', data: 'GenuineIntel' },
              { name: '~MHz', type: 'REG_DWORD', data: '0x00000E1C' },
              { name: 'Identifier', type: 'REG_SZ', data: 'Intel64 Family 6 Model 151 Stepping 2' },
              { name: 'FeatureSet', type: 'REG_DWORD', data: '0xBFEBFBFF' },
            ]},
          ]},
        ]},
        { name: 'ACPI', children: [
          { name: 'BIOS', values: [
            { name: 'OEMTableId', type: 'REG_BINARY', data: '50 52 49 4D 45 20 5A 36 39 30' },
            { name: 'TableSignature', type: 'REG_BINARY', data: '41 50 49 43' },
          ]},
        ]},
        { name: 'DEVICEMAP', children: [
          { name: 'VIDEO', values: [
            { name: '\\Device\\Video0', type: 'REG_SZ', data: '\\Registry\\Machine\\System\\CurrentControlSet\\Control\\Video\\{4D36E968}\\0000' },
          ]},
        ]},
      ]},
      { name: 'SOFTWARE', children: [
        { name: 'Microsoft', children: [
          { name: 'Windows NT', children: [
            { name: 'CurrentVersion', values: [
              { name: 'ProductName', type: 'REG_SZ', data: 'Windows 10 Pro' },
              { name: 'CurrentVersion', type: 'REG_SZ', data: '10.0' },
              { name: 'CurrentBuildNumber', type: 'REG_SZ', data: '19045' },
              { name: 'CurrentBuild', type: 'REG_SZ', data: '19045' },
              { name: 'UBR', type: 'REG_DWORD', data: '0x000009B5' },
              { name: 'ReleaseId', type: 'REG_SZ', data: '22H2' },
              { name: 'RegisteredOwner', type: 'REG_SZ', data: 'User' },
              { name: 'RegisteredOrganization', type: 'REG_SZ', data: '' },
              { name: 'SystemRoot', type: 'REG_SZ', data: 'C:\\Windows' },
              { name: 'InstallDate', type: 'REG_DWORD', data: '0x65934b80' },
              { name: 'InstallTime', type: 'REG_QWORD', data: '0x01DA14A2B8F4C000' },
              { name: 'EditionID', type: 'REG_SZ', data: 'Professional' },
              { name: 'CompositionEditionID', type: 'REG_SZ', data: 'Professional' },
              { name: 'BuildLab', type: 'REG_SZ', data: '19041.vb_release.191206-1406' },
              { name: 'BuildLabEx', type: 'REG_SZ', data: '19045.2965.amd64fre.vb_release_svc_prod3.230411-1628' },
              { name: 'PathName', type: 'REG_SZ', data: 'C:\\Windows' },
              { name: 'DigitalProductId', type: 'REG_BINARY', data: 'A4 00 00 00 03 00 00 00 36 33 35 39 36...' },
            ]},
          ]},
          { name: 'Windows', children: [
            { name: 'CurrentVersion', children: [
              { name: 'Run', values: [
                { name: 'SecurityHealth', type: 'REG_EXPAND_SZ', data: '%windir%\\system32\\SecurityHealthSystray.exe' },
                { name: 'WindowsDefender', type: 'REG_EXPAND_SZ', data: '%ProgramFiles%\\Windows Defender\\MSASCuiL.exe' },
              ]},
              { name: 'Uninstall', children: [
                { name: 'Steam', values: [
                  { name: 'DisplayName', type: 'REG_SZ', data: 'Steam' },
                  { name: 'DisplayVersion', type: 'REG_SZ', data: '2.10.91.91' },
                  { name: 'Publisher', type: 'REG_SZ', data: 'Valve Corporation' },
                  { name: 'InstallLocation', type: 'REG_SZ', data: 'C:\\Program Files (x86)\\Steam' },
                  { name: 'UninstallString', type: 'REG_SZ', data: '"C:\\Program Files (x86)\\Steam\\uninstall.exe"' },
                  { name: 'EstimatedSize', type: 'REG_DWORD', data: '0x00073A9C' },
                ]},
                { name: 'Discord', values: [
                  { name: 'DisplayName', type: 'REG_SZ', data: 'Discord' },
                  { name: 'DisplayVersion', type: 'REG_SZ', data: '1.0.9163' },
                  { name: 'Publisher', type: 'REG_SZ', data: 'Discord Inc.' },
                  { name: 'InstallLocation', type: 'REG_SZ', data: 'C:\\Users\\User\\AppData\\Local\\Discord' },
                  { name: 'EstimatedSize', type: 'REG_DWORD', data: '0x000527BD' },
                ]},
                { name: '{AC76BA86-7AD7-1033-7B44-AC0F074E4100}', values: [
                  { name: 'DisplayName', type: 'REG_SZ', data: 'Adobe Acrobat DC (64-bit)' },
                  { name: 'DisplayVersion', type: 'REG_SZ', data: '24.001.20759' },
                  { name: 'Publisher', type: 'REG_SZ', data: 'Adobe Systems Incorporated' },
                  { name: 'InstallLocation', type: 'REG_SZ', data: 'C:\\Program Files\\Adobe\\Acrobat DC\\' },
                  { name: 'EstimatedSize', type: 'REG_DWORD', data: '0x0008E3F0' },
                ]},
                { name: 'VLC media player', values: [
                  { name: 'DisplayName', type: 'REG_SZ', data: 'VLC media player' },
                  { name: 'DisplayVersion', type: 'REG_SZ', data: '3.0.20' },
                  { name: 'Publisher', type: 'REG_SZ', data: 'VideoLAN' },
                  { name: 'InstallLocation', type: 'REG_SZ', data: 'C:\\Program Files\\VideoLAN\\VLC' },
                ]},
                { name: '{6F320B93-EE3C-4826-85E0-ADF79F8D4C61}', values: [
                  { name: 'DisplayName', type: 'REG_SZ', data: 'NVIDIA GeForce Experience 3.27.0.120' },
                  { name: 'Publisher', type: 'REG_SZ', data: 'NVIDIA Corporation' },
                  { name: 'DisplayVersion', type: 'REG_SZ', data: '3.27.0.120' },
                  { name: 'InstallLocation', type: 'REG_SZ', data: 'C:\\Program Files\\NVIDIA Corporation\\NVIDIA GeForce Experience' },
                ]},
              ]},
              { name: 'WindowsUpdate', children: [
                { name: 'AU', values: [
                  { name: 'NoAutoUpdate', type: 'REG_DWORD', data: '0x00000000' },
                  { name: 'AUOptions', type: 'REG_DWORD', data: '0x00000004' },
                  { name: 'ScheduledInstallDay', type: 'REG_DWORD', data: '0x00000000' },
                  { name: 'ScheduledInstallTime', type: 'REG_DWORD', data: '0x00000003' },
                ]},
              ]},
              { name: 'Policies', children: [
                { name: 'System', values: [
                  { name: 'EnableLUA', type: 'REG_DWORD', data: '0x00000001' },
                  { name: 'ConsentPromptBehaviorAdmin', type: 'REG_DWORD', data: '0x00000005' },
                  { name: 'PromptOnSecureDesktop', type: 'REG_DWORD', data: '0x00000001' },
                ]},
              ]},
              { name: 'Themes', values: [
                { name: 'CurrentTheme', type: 'REG_SZ', data: 'C:\\Windows\\resources\\Themes\\dark.theme' },
              ]},
            ]},
          ]},
          { name: 'DirectX', children: [
            { name: 'Configuration', values: [
              { name: 'InstalledVersion', type: 'REG_BINARY', data: '00 00 00 00 0C 00 00 00' },
            ]},
          ]},
          { name: 'NET Framework Setup', children: [
            { name: 'NDP', children: [
              { name: 'v4', children: [
                { name: 'Full', values: [
                  { name: 'Install', type: 'REG_DWORD', data: '0x00000001' },
                  { name: 'Release', type: 'REG_DWORD', data: '0x00085BA2' },
                  { name: 'Version', type: 'REG_SZ', data: '4.8.09032' },
                ]},
              ]},
            ]},
          ]},
        ]},
        { name: 'NVIDIA Corporation', children: [
          { name: 'Global', children: [
            { name: 'FTS', values: [
              { name: 'EnableGR535', type: 'REG_DWORD', data: '0x00000001' },
            ]},
            { name: 'Installer2', children: [
              { name: 'Patch', values: [
                { name: 'Version', type: 'REG_SZ', data: '551.86' },
                { name: 'BuildNumber', type: 'REG_SZ', data: '551.86.00' },
                { name: 'DriverDate', type: 'REG_SZ', data: '2/7/2024' },
              ]},
            ]},
          ]},
        ]},
        { name: 'Malwarebytes', children: [
          { name: 'Malwarebytes Anti-Malware', values: [
            { name: 'Version', type: 'REG_SZ', data: '4.6.7.287' },
            { name: 'DatabaseVersion', type: 'REG_SZ', data: '1.0.81524' },
            { name: 'LastScan', type: 'REG_SZ', data: '2026-03-17T08:22:41' },
            { name: 'RealTimeProtectionEnabled', type: 'REG_DWORD', data: '0x00000001' },
          ]},
        ]},
        { name: 'Python', children: [
          { name: 'PythonCore', children: [
            { name: '3.11', children: [
              { name: 'InstallPath', values: [
                { name: '(Default)', type: 'REG_SZ', data: 'C:\\Program Files\\Python311\\' },
                { name: 'ExecutablePath', type: 'REG_SZ', data: 'C:\\Program Files\\Python311\\python.exe' },
              ]},
            ]},
          ]},
        ]},
        { name: 'Node.js', values: [
          { name: 'InstallPath', type: 'REG_SZ', data: 'C:\\Program Files\\nodejs\\' },
          { name: 'Version', type: 'REG_SZ', data: '20.11.0' },
        ]},
      ]},
      { name: 'SYSTEM', children: [
        { name: 'CurrentControlSet', children: [
          { name: 'Services', children: [
            { name: 'Tcpip', children: [
              { name: 'Parameters', values: [
                { name: 'Domain', type: 'REG_SZ', data: '' },
                { name: 'NV Domain', type: 'REG_SZ', data: '' },
                { name: 'NameServer', type: 'REG_SZ', data: '1.1.1.1,8.8.8.8' },
                { name: 'SearchList', type: 'REG_SZ', data: 'local' },
                { name: 'Hostname', type: 'REG_SZ', data: 'DESKTOP-WIN10' },
              ]},
            ]},
            { name: 'Disk', values: [
              { name: 'Start', type: 'REG_DWORD', data: '0x00000000' },
              { name: 'Type', type: 'REG_DWORD', data: '0x00000001' },
            ]},
            { name: 'Winsock', children: [
              { name: 'Parameters', values: [
                { name: 'MaxSockAddrLength', type: 'REG_DWORD', data: '0x00000010' },
                { name: 'MinSockAddrLength', type: 'REG_DWORD', data: '0x00000010' },
              ]},
            ]},
            { name: 'WLAN AutoConfig', values: [
              { name: 'Start', type: 'REG_DWORD', data: '0x00000002' },
              { name: 'ObjectName', type: 'REG_SZ', data: 'LocalSystem' },
            ]},
          ]},
          { name: 'Control', children: [
            { name: 'ComputerName', children: [
              { name: 'ComputerName', values: [
                { name: 'ComputerName', type: 'REG_SZ', data: 'DESKTOP-WIN10' },
              ]},
              { name: 'ActiveComputerName', values: [
                { name: 'ComputerName', type: 'REG_SZ', data: 'DESKTOP-WIN10' },
              ]},
            ]},
            { name: 'Session Manager', values: [
              { name: 'CriticalSectionTimeout', type: 'REG_DWORD', data: '0xFFFFFFFF' },
              { name: 'HeapDeCommitFreeBlockThreshold', type: 'REG_DWORD', data: '0x00000000' },
              { name: 'HeapDeCommitTotalFreeThreshold', type: 'REG_DWORD', data: '0x00000000' },
              { name: 'NumberOfInitialSessions', type: 'REG_DWORD', data: '0x00000002' },
              { name: 'ProtectionMode', type: 'REG_DWORD', data: '0x00000001' },
              { name: 'ObjectDirectories', type: 'REG_MULTI_SZ', data: '\\Windows\n\\RPC Control' },
            ]},
            { name: 'TimeZoneInformation', values: [
              { name: 'TimeZoneKeyName', type: 'REG_SZ', data: 'Eastern Standard Time' },
              { name: 'ActiveTimeBias', type: 'REG_DWORD', data: '0x00000124' },
              { name: 'Bias', type: 'REG_DWORD', data: '0x00000124' },
              { name: 'DaylightBias', type: 'REG_DWORD', data: '0xFFFFFFC4' },
            ]},
            { name: 'Power', values: [
              { name: 'HibernateEnabled', type: 'REG_DWORD', data: '0x00000001' },
              { name: 'SleepEnabled', type: 'REG_DWORD', data: '0x00000001' },
            ]},
            { name: 'NetworkProvider', children: [
              { name: 'Order', values: [
                { name: 'ProviderOrder', type: 'REG_SZ', data: 'RDPNP,LanmanWorkstation,webclient' },
              ]},
            ]},
            { name: 'Nls', children: [
              { name: 'Language', values: [
                { name: '(Default)', type: 'REG_SZ', data: '0409' },
                { name: 'Default', type: 'REG_SZ', data: '0409' },
              ]},
              { name: 'Locale', values: [
                { name: '00000409', type: 'REG_SZ', data: '2' },
              ]},
            ]},
          ]},
          { name: 'Enum', children: [
            { name: 'PCI', children: [
              { name: 'VEN_10DE&DEV_2786', values: [
                { name: 'DeviceDesc', type: 'REG_SZ', data: 'NVIDIA GeForce RTX 4070' },
                { name: 'ClassGUID', type: 'REG_SZ', data: '{4D36E968-E325-11CE-BFC1-08002BE10318}' },
                { name: 'Driver', type: 'REG_SZ', data: '{4D36E968-E325-11CE-BFC1-08002BE10318}\\0000' },
              ]},
              { name: 'VEN_8086&DEV_7A4D', values: [
                { name: 'DeviceDesc', type: 'REG_SZ', data: 'Intel Wi-Fi 6E AX211 160MHz' },
                { name: 'ClassGUID', type: 'REG_SZ', data: '{4D36E972-E325-11CE-BFC1-08002BE10318}' },
              ]},
            ]},
            { name: 'USB', children: [
              { name: 'VID_046D&PID_C548', values: [
                { name: 'DeviceDesc', type: 'REG_SZ', data: 'Logitech MX Master 3S' },
                { name: 'ClassGUID', type: 'REG_SZ', data: '{745A17A0-74D3-11D0-B6FE-00A0C90F57DA}' },
              ]},
              { name: 'VID_0B05&PID_1866', values: [
                { name: 'DeviceDesc', type: 'REG_SZ', data: 'ASUS USB-BT500 Bluetooth 5.0 Adapter' },
                { name: 'ClassGUID', type: 'REG_SZ', data: '{E0CBF06C-CD8B-4647-BB8A-263B43F0F974}' },
              ]},
            ]},
          ]},
        ]},
      ]},
    ],
  },
  {
    name: 'HKEY_USERS', children: [
      { name: '.DEFAULT', children: [
        { name: 'Software', children: [
          { name: 'Microsoft', children: [
            { name: 'Windows', children: [
              { name: 'CurrentVersion', children: [
                { name: 'Run', values: [{ name: '(Default)', type: 'REG_SZ', data: '(value not set)' }] },
              ]},
            ]},
          ]},
        ]},
      ]},
      { name: 'S-1-5-18', values: [{ name: '(Default)', type: 'REG_SZ', data: '(value not set)' }] },
      { name: 'S-1-5-19', values: [{ name: '(Default)', type: 'REG_SZ', data: '(value not set)' }] },
      { name: 'S-1-5-20', values: [{ name: '(Default)', type: 'REG_SZ', data: '(value not set)' }] },
      { name: 'S-1-5-21-1234567890-123456789-1234567890-1001', children: [
        { name: 'Software', children: [
          { name: 'Microsoft', children: [
            { name: 'Windows', children: [
              { name: 'CurrentVersion', children: [
                { name: 'Run', values: [
                  { name: 'Discord', type: 'REG_SZ', data: 'C:\\Users\\User\\AppData\\Local\\Discord\\Update.exe --processStart Discord.exe' },
                  { name: 'Spotify', type: 'REG_SZ', data: 'C:\\Users\\User\\AppData\\Roaming\\Spotify\\Spotify.exe' },
                ]},
              ]},
            ]},
          ]},
        ]},
      ]},
    ],
  },
  {
    name: 'HKEY_CURRENT_CONFIG', children: [
      { name: 'Software', children: [
        { name: 'Fonts', values: [
          { name: 'LogPixels', type: 'REG_DWORD', data: '0x00000060' },
        ]},
        { name: 'Microsoft', children: [
          { name: 'Windows NT', children: [
            { name: 'CurrentVersion', children: [
              { name: 'Fonts', values: [
                { name: 'Arial (TrueType)', type: 'REG_SZ', data: 'arial.ttf' },
                { name: 'Calibri (TrueType)', type: 'REG_SZ', data: 'calibri.ttf' },
                { name: 'Consolas (TrueType)', type: 'REG_SZ', data: 'consola.ttf' },
                { name: 'Courier New (TrueType)', type: 'REG_SZ', data: 'cour.ttf' },
                { name: 'Segoe UI (TrueType)', type: 'REG_SZ', data: 'segoeui.ttf' },
                { name: 'Times New Roman (TrueType)', type: 'REG_SZ', data: 'times.ttf' },
              ]},
            ]},
          ]},
        ]},
      ]},
      { name: 'System', children: [
        { name: 'CurrentControlSet', children: [
          { name: 'Control', children: [
            { name: 'VIDEO', children: [
              { name: '0000', values: [
                { name: 'DefaultSettings.BitsPerPel', type: 'REG_DWORD', data: '0x00000020' },
                { name: 'DefaultSettings.XResolution', type: 'REG_DWORD', data: '0x00000780' },
                { name: 'DefaultSettings.YResolution', type: 'REG_DWORD', data: '0x00000438' },
                { name: 'DefaultSettings.VRefresh', type: 'REG_DWORD', data: '0x00000090' },
              ]},
            ]},
          ]},
        ]},
      ]},
    ],
  },
];

function flattenRegistry(keys: RegKey[], prefix = 'Computer'): { path: string; node: RegKey }[] {
  const result: { path: string; node: RegKey }[] = [];
  for (const key of keys) {
    const path = `${prefix}\\${key.name}`;
    result.push({ path, node: key });
    if (key.children) {
      result.push(...flattenRegistry(key.children, path));
    }
  }
  return result;
}

function TreeNode({ node, depth, selected, onSelect }: {
  node: RegKey; depth: number; selected: string; onSelect: (path: string, node: RegKey) => void;
}) {
  const [open, setOpen] = useState(depth <= 1);
  const [ctxPos, setCtxPos] = useState<{ x: number; y: number } | null>(null);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div
        className={`re-tree-row ${selected === node.name ? 'selected' : ''}`}
        style={{ paddingLeft: 8 + depth * 14 }}
        onClick={() => { onSelect(node.name, node); if (hasChildren) setOpen(o => !o); }}
        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onSelect(node.name, node); setCtxPos({ x: e.clientX, y: e.clientY }); }}
      >
        <span className="re-caret">{hasChildren ? (open ? '▼' : '▶') : ' '}</span>
        <span className="re-key-icon">📁</span>
        <span className="re-key-name">{node.name}</span>
      </div>
      {ctxPos && (
        <ContextMenu
          x={ctxPos.x} y={ctxPos.y}
          items={[
            { label: 'Copy Key Name', icon: '📋', onClick: () => navigator.clipboard.writeText(node.name) },
            { label: 'New Key', onClick: () => {}, disabled: true },
            'separator',
            { label: 'Delete', onClick: () => {}, disabled: true },
            { label: 'Rename', onClick: () => {}, disabled: true },
          ]}
          onClose={() => setCtxPos(null)}
        />
      )}
      {open && hasChildren && node.children!.map(child => (
        <TreeNode key={child.name} node={child} depth={depth + 1} selected={selected} onSelect={onSelect} />
      ))}
    </div>
  );
}

export default function RegistryEditor() {
  const [selected, setSelected] = useState('');
  const [selectedNode, setSelectedNode] = useState<RegKey | null>(null);
  const [searchVal, setSearchVal] = useState('');
  const [searching, setSearching] = useState(false);
  const [valCtx, setValCtx] = useState<{ x: number; y: number; v: RegValue } | null>(null);

  const allKeys = useMemo(() => flattenRegistry(REGISTRY), []);

  const searchResults = useMemo(() => {
    if (!searchVal.trim()) return [];
    const q = searchVal.toLowerCase();
    return allKeys.filter(({ path, node }) =>
      node.name.toLowerCase().includes(q) ||
      path.toLowerCase().includes(q) ||
      node.values?.some(v => v.name.toLowerCase().includes(q) || v.data.toLowerCase().includes(q))
    );
  }, [searchVal, allKeys]);

  const defaultValues: RegValue[] = [
    { name: '(Default)', type: 'REG_SZ', data: '(value not set)' },
  ];

  const values = selectedNode?.values ?? defaultValues;

  return (
    <div className="re-root">
      <div className="re-menubar">
        {['File', 'Edit', 'View', 'Favorites', 'Help'].map(m => (
          <span key={m} className="re-menu">{m}</span>
        ))}
      </div>
      <div className="re-address-bar">
        <span className="re-addr-label">Computer</span>
        <input
          className="re-addr-input"
          placeholder="Search registry keys and values..."
          value={searching ? searchVal : (selected ? `Computer\\${selected}` : 'Computer')}
          onChange={e => { setSearchVal(e.target.value); setSearching(true); }}
          onFocus={() => { setSearching(true); }}
          onBlur={() => { if (!searchVal) setSearching(false); }}
        />
        {searching && searchVal && (
          <button style={{ marginLeft: 4, padding: '2px 8px', fontSize: 11, cursor: 'pointer' }} onClick={() => { setSearchVal(''); setSearching(false); }}>✕ Clear</button>
        )}
      </div>
      <div className="re-body">
        <div className="re-tree">
          {searching && searchVal ? (
            <div>
              <div style={{ padding: '4px 8px', fontSize: 11, color: '#aaa', borderBottom: '1px solid #333' }}>
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchVal}"
              </div>
              {searchResults.slice(0, 100).map(({ path, node }) => (
                <div key={path} className={`re-tree-row ${selected === node.name ? 'selected' : ''}`}
                  style={{ paddingLeft: 8 }}
                  onClick={() => { setSelected(node.name); setSelectedNode(node); }}>
                  <span className="re-caret"> </span>
                  <span className="re-key-icon">📁</span>
                  <span className="re-key-name" title={path}>{node.name}</span>
                  <span style={{ fontSize: 10, color: '#666', marginLeft: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{path.replace('Computer\\', '')}</span>
                </div>
              ))}
              {searchResults.length > 100 && (
                <div style={{ padding: '4px 8px', fontSize: 11, color: '#888' }}>Showing first 100 results…</div>
              )}
            </div>
          ) : (
            <>
              <div className="re-computer-root">
                <span>🖥️</span>
                <span style={{ marginLeft: 4, fontWeight: 600 }}>Computer</span>
              </div>
              {REGISTRY.map(hive => (
                <TreeNode key={hive.name} node={hive} depth={1} selected={selected} onSelect={(name, node) => { setSelected(name); setSelectedNode(node); setSearching(false); setSearchVal(''); }} />
              ))}
            </>
          )}
        </div>
        <div className="re-values">
          <div className="re-values-header">
            <span>Name</span><span>Type</span><span>Data</span>
          </div>
          {values.map(v => (
            <div
              key={v.name}
              className="re-value-row"
              onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setValCtx({ x: e.clientX, y: e.clientY, v }); }}
            >
              <span className="re-val-name">{v.name}</span>
              <span className="re-val-type">{v.type}</span>
              <span className="re-val-data">{v.data}</span>
            </div>
          ))}
          {valCtx && (
            <ContextMenu
              x={valCtx.x} y={valCtx.y}
              items={[
                { label: 'Copy Name', icon: '📋', onClick: () => navigator.clipboard.writeText(valCtx.v.name) },
                { label: 'Copy Data', icon: '📋', onClick: () => navigator.clipboard.writeText(valCtx.v.data) },
                'separator',
                { label: 'Modify', onClick: () => {}, disabled: true },
                { label: 'Delete', onClick: () => {}, disabled: true },
              ]}
              onClose={() => setValCtx(null)}
            />
          )}
        </div>
      </div>
      <div className="re-statusbar">
        {searching && searchVal ? `Search: "${searchVal}" — ${searchResults.length} results` : (selected ? `Computer\\${selected}` : 'Computer')}
      </div>
    </div>
  );
}
