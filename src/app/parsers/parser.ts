import { FileType } from '../enums'
import { crashReportParser } from './fileParsers/crashReportParser'
import { extendedMultimcLogParser } from './fileParsers/extendedMultimcLogParser'
import { hotspotCrashDumpParser } from './fileParsers/hotspotCrashDumpParser'
import { launcherLogParser } from './fileParsers/launcherLogParser'
import { serverPropertiesParser } from './fileParsers/serverPropertiesParser'
import { standardLogParser } from './fileParsers/standardLogParser'
import { unknownFileParser } from './fileParsers/unknownFileParser'
import getMinecraftFileType from './fileTypeParser'
import getLines from './lineParser'

export async function getFileInfo(
    file: any,
    removeDuplicates: boolean = true,
    useLocalTime: boolean = false,
    enableDebugging: boolean = false
) {
    const lines = await getLines(file, removeDuplicates)
    const fileType = getMinecraftFileType(lines, file.name)
    const parser = getFileParser(fileType)
    const parsedFileInfo = parser.parse(lines)

    if (enableDebugging) console.info(parsedFileInfo)

    const fileInfo = {
        name: file.name,
        modified: getLastModified(file.lastModified, useLocalTime),
        lineCount: lines.length.toString(),
        lines: lines, 
        ...parsedFileInfo
    }
    
    return fileInfo
}

// Returns a parser object for a specific file type
export function getFileParser(fileType: FileType) {
    switch (fileType) {
        case FileType.STANDARD_LOG:
            return standardLogParser
        case FileType.EXTENDED_MULTIMC_LOG:
            return extendedMultimcLogParser
        case FileType.CRASH_REPORT:
            return crashReportParser
        case FileType.LAUNCHER_LOG:
            return launcherLogParser
        case FileType.HOTSPOT_CRASH_DUMP:
            return hotspotCrashDumpParser
        case FileType.SERVER_PROPERTIES:
            return serverPropertiesParser
        case FileType.UNKNOWN:
            return unknownFileParser
    }
}

// Converts Unix timestamp to local datetime
export function getLastModified(lastModified: number, useLocalTime: boolean) {
    if (lastModified === 0) {
        return ''
    }

    const date = new Date(lastModified)
    const timeZone = useLocalTime ? Intl.DateTimeFormat().resolvedOptions().timeZone : "Zulu"
    return date.toLocaleString('en-US', { timeZone })
}