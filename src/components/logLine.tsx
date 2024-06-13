import { LogLevel } from '@/constants/enums'

export default function LogLine({ line, lineNumber }: { line: string; lineNumber: number }) {
    const logLevel = getLogLevel(line)
    const styledLine = () => {
        if (logLevel !== LogLevel.STACKTRACE) {
            return (
                <span id={`${lineNumber + 1}`} className={logLevel} style={{ display: 'block', lineHeight: '20px' }}>
                   {line}
               </span>
            )
        }
        return getStacktraceLine(line, lineNumber)
    }
    return styledLine()
}

export function isStacktrace(line: string) {}

export function getLogLevel(line: string) {
    if (line.includes('/INFO]')) {
        return LogLevel.INFO
    } else if (line.includes('/WARN]')) {
        return LogLevel.WARNING
    } else if (line.includes('/ERROR]') || line.includes('/FATAL]')) {
        return LogLevel.ERROR
    } else if (line.match(/((.\w+Exception:)|(.\w+Error:))/g)) {
        return LogLevel.ERROR
    } else if (line.trim().startsWith('at ')) {
        return LogLevel.STACKTRACE
    } else if (line.startsWith('      Repeated')) {
        return LogLevel.REPEATED
    } else {
        return LogLevel.UNKNOWN
    }
}

// at com.tterrag.registrate.util.entry.RegistryEntry.get(RegistryEntry.java:114) ~[Registrate-MC1.20-1.3.11.jar%23602!/:?] {re:mixin,re:classloading}
export function getStacktraceLine(line: string, lineNumber: number) {
    return (
        <span id={`${lineNumber + 1}`} className={LogLevel.STACKTRACE} style={{ display: 'block', lineHeight: '20px' }}>
            <span className="class-path"> {getClassPath(line)}</span>
            <span className="class-name">{getClassName(line)}</span>
            <span className="method">{getMethod(line)}</span>
            <span className="class-file">{getClassFile(line)} </span>
            <span className="jar">{getJar(line)} </span>
            <span className="mixin-list">{getMixinList(line)}</span>
        </span>
    )
}

export function getClassPath(line: string) {
    const start = line.indexOf('at ') - 3
    const end = indexOfFirstUppercase(line)
    return line.substring(start, end)
}

export function getClassName(line: string) {
    const start = indexOfFirstUppercase(line)
    const end = line.indexOf('.', start) + 1
    return line.substring(start, end)
}

export function getMethod(line: string) {
    const startOfClassName = indexOfFirstUppercase(line)
    const start = line.indexOf('.', startOfClassName) + 1
    const end = line.indexOf('(')
    return line.substring(start, end)
}

export function getClassFile(line: string) {
    const start = line.indexOf('(')
    const end = line.indexOf(')') + 1
    return line.substring(start, end)
}

export function getJar(line: string) {
    const start = line.indexOf('~[')
    const end = line.indexOf(']') + 1
    return line.substring(start, end)
}

export function getMixinList(line: string) {
    const start = line.indexOf('{')
    return line.substring(start, line.length)
}

export function indexOfFirstUppercase(string: string) {
    for (let i = 0; i < string.length; i++) {
        if (string[i] == string[i].toUpperCase() && (string[i].match(/[a-z]/i))) {
            return i
        }
    }
    return 0
}