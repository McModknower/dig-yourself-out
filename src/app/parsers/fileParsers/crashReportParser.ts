import getIssues from '../issueParser'
import generalRules from '../../rules/general.json'
import crashReportRules from '../../rules/crash.json'

export const crashReportParser = {
    parse: (lines: string[]) => {
        const issues = getIssues({ lines }, [generalRules, crashReportRules])

        return { issues }
    }
}