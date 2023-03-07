import { FC } from "react";
import { SolutionReport, TestReport } from "../../api";
import ByteSize from "../ByteSize";
import Duration from "../Duration";
import Tooltip from "../Tooltip";

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
        description: "Running",
        disableUsage: true,
    },
    "accepted": {
        code: "accepted",
        title: "Accepted",
        description: "Accepted",
    },
    "rejected": {
        code: "rejected",
        title: "Rejected",
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
        titleTest: "TLE {}",
        description: "Time limit exceeded",
    },
    "memory_limit_exceeded": {
        code: "mle",
        title: "MLE",
        titleTest: "MLE {}",
        description: "Memory limit exceeded",
    },
    "runtime_error": {
        code: "re",
        title: "RE",
        titleTest: "RE {}",
        description: "Run-time error",
    },
    "wrong_answer": {
        code: "wa",
        title: "WA",
        titleTest: "WA {}",
        description: "Wrong answer",
    },
    "presentation_error": {
        code: "pe",
        title: "PE",
        titleTest: "PE {}",
        description: "Presentation error",
    },
    "partially_accepted": {
        code: "pa",
        title: "Partial",
        description: "Partially accepted",
    },
    "failed": {
        code: "failed",
        title: "Failed",
        description: "Failed",
        disableUsage: true,
    },
};

const getTitle = (info?: VerdictInfo, testNumber?: number) => {
    if (!info) {
        return undefined;
    }
    if (testNumber && info.titleTest) {
        return info.titleTest.replace("{}", String(testNumber));
    }
    return info.title;
};

const Verdict: FC<VerdictProps> = props => {
    const { report } = props;
    const verdict = report?.verdict;
    const points = report?.points;
    const used_time = report?.used_time;
    const used_memory = report?.used_memory;
    const test_number = report?.test_number;
    const info = verdict ? VERDICTS[verdict] : VERDICTS["running"];
    const title = getTitle(info, test_number) ?? verdict;
    const disableUsage = info?.disableUsage ?? false;
    return <Tooltip className="ui-verdict-wrap" content={<div className="ui-verdict-details">
        <span className={`item description ui-verdict ${info?.code ?? "unknown"}`}>{info?.description ?? verdict}</span>
        {points !== undefined && <span className="item points">Points: {points}</span>}
        {test_number && <span className="item test">on test {test_number}</span>}
        {!disableUsage && <span className="item time"><Duration value={(used_time ?? 0) * 0.001} /></span>}
        {!disableUsage && <span className="item memory"><ByteSize value={used_memory ?? 0} /></span>}
    </div>}>
        <span className={`ui-verdict ${info?.code ?? "unknown"}`}>{title}</span>
        {points !== undefined && <span className="points">Points: {points}</span>}
    </Tooltip >;
};

type TestVerdictProps = {
    report?: TestReport;
};

export const TestVerdict: FC<TestVerdictProps> = props => {
    const { report } = props;
    const verdict = report?.verdict;
    const info = verdict ? VERDICTS[verdict] : VERDICTS["running"];
    return <Tooltip className={`ui-verdict ${info?.code ?? "unknown"}`} content={<div className="ui-verdict-details">
        <span className={`item description ui-verdict ${info?.code ?? "unknown"}`}>{info?.description ?? verdict}</span>
    </div>}>{info?.title ?? verdict}</Tooltip>;
};

export default Verdict;
