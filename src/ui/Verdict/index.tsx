import { FC, useContext } from "react";
import { SolutionReport, TestReport } from "../../api";
import ByteSize from "../ByteSize";
import Duration from "../Duration";
import Tooltip from "../Tooltip";
import { LocaleContext, LocalizeKeyFn } from "../Locale";

import "./index.scss";

type VerdictProps = {
    report?: SolutionReport;
};

type VerdictInfo = {
    code: string;
    title: string;
    titleTest?: string;
    description: string;
    disableUsage?: boolean;
};

const VERDICTS: Record<string, VerdictInfo | undefined> = {
    "queued": {
        code: "queued",
        title: "Queued",
        description: "Queued",
        disableUsage: true,
    },
    "running": {
        code: "running",
        title: "Running",
        titleTest: "Test {test}",
        description: "Running",
        disableUsage: true,
    },
    "accepted": {
        code: "accepted",
        title: "OK",
        description: "Accepted",
    },
    "rejected": {
        code: "rejected",
        title: "RJ",
        description: "Rejected",
    },
    "compilation_error": {
        code: "ce",
        title: "CE",
        description: "Compilation error",
        disableUsage: true,
    },
    "time_limit_exceeded": {
        code: "tle",
        title: "TLE",
        titleTest: "TLE {test}",
        description: "Time limit exceeded",
    },
    "memory_limit_exceeded": {
        code: "mle",
        title: "MLE",
        titleTest: "MLE {test}",
        description: "Memory limit exceeded",
    },
    "runtime_error": {
        code: "re",
        title: "RE",
        titleTest: "RE {test}",
        description: "Run-time error",
    },
    "wrong_answer": {
        code: "wa",
        title: "WA",
        titleTest: "WA {test}",
        description: "Wrong answer",
    },
    "presentation_error": {
        code: "pe",
        title: "PE",
        titleTest: "PE {test}",
        description: "Presentation error",
    },
    "partially_accepted": {
        code: "pa",
        title: "PA",
        description: "Partially accepted",
    },
    "failed": {
        code: "failed",
        title: "Failed",
        description: "Failed",
        disableUsage: true,
    },
};

const getTitle = (localizeKey: LocalizeKeyFn, info?: VerdictInfo, testNumber?: number) => {
    if (!info) {
        return undefined;
    }
    if (testNumber && info.titleTest) {
        return localizeKey(`verdict_${info.code}_title_test`, info.titleTest).replace("{test}", String(testNumber));
    }
    return localizeKey(`verdict_${info.code}_title`, info.title);
};

const getDescription = (localizeKey: LocalizeKeyFn, info?: VerdictInfo) => {
    if (!info) {
        return undefined;
    }
    return localizeKey(`verdict_${info.code}_description`, info.description);
};

const Verdict: FC<VerdictProps> = props => {
    const { report } = props;
    const { localize, localizeKey } = useContext(LocaleContext);
    const verdict = report?.verdict;
    const points = report?.points;
    const used_time = report?.used_time;
    const used_memory = report?.used_memory;
    const test_number = report?.test_number;
    const info = VERDICTS[verdict ? verdict : "running"];
    const title = getTitle(localizeKey, info, test_number) ?? verdict;
    const description = getDescription(localizeKey, info) ?? verdict;
    const disableUsage = info?.disableUsage ?? false;
    return <Tooltip className="ui-verdict-wrap" content={<div className="ui-verdict-details">
        <span className={`item description ui-verdict ${info?.code ?? "unknown"}`}>{description}</span>
        {points !== undefined && <span className="item points">{localize("Points")}: {points}</span>}
        {test_number && <span className="item test">{localize("On test")} {test_number}</span>}
        {!disableUsage && <span className="item time"><Duration value={(used_time ?? 0) * 0.001} /></span>}
        {!disableUsage && <span className="item memory"><ByteSize value={used_memory ?? 0} /></span>}
    </div>}>
        <span className={`ui-verdict ${info?.code ?? "unknown"}`}>{title}</span>
        {points !== undefined && <span className="points">{localize("Points")}: {points}</span>}
    </Tooltip >;
};

type TestVerdictProps = {
    report?: TestReport;
};

export const TestVerdict: FC<TestVerdictProps> = props => {
    const { report } = props;
    const { localizeKey } = useContext(LocaleContext);
    const verdict = report?.verdict;
    const info = VERDICTS[verdict ? verdict : "running"];
    const title = getTitle(localizeKey, info) ?? verdict;
    const description = getDescription(localizeKey, info) ?? verdict;
    return <Tooltip className={`ui-verdict ${info?.code ?? "unknown"}`} content={<div className="ui-verdict-details">
        <span className={`item description ui-verdict ${info?.code ?? "unknown"}`}>{description}</span>
    </div>}>{title}</Tooltip>;
};

export default Verdict;
