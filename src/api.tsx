export type UserID = number | string;

export type ErrorField = {
	message: string;
};

export type ErrorResp = {
	message: string;
	missing_roles?: string[];
	invalid_fields?: {[key: string]: ErrorField};
};

export type User = {
	id: number;
	login: string;
	email?: string;
	first_name?: string;
	last_name?: string;
	middle_name?: string;
};

export type Session = {
	id: number;
	create_time: number;
	expire_time: number;
};

export type Status = {
	session: Session;
	user: User;
	roles: string[];
};

export type Problem = {
	ID: number;
	UserID: number;
	CreateTime: number;
	Title: string;
	Description: string;
	Solutions?: Solution[];
};

export type ContestProblem = Problem & {
	ContestID: number;
	Code: string;
};

export type Contest = {
	ID: number;
	UserID: number;
	CreateTime: number;
	Title: string;
	Problems: ContestProblem[];
};

export type ContestsResp = {
	contests?: Contest[];
};

export type Compiler = {
	ID: number;
	Name: string;
	CreateTime: number;
};

type ReportDataLogs = {
	Stderr: string;
	Stdout: string;
};

type ReportDataUsage = {
	Time: number;
	Memory: number;
};

type ReportDataTest = {
	CheckLogs: ReportDataLogs;
	Usage: ReportDataUsage;
	Verdict: number;
	Points?: number;
};

type ReportData = {
	PrecompileLogs: ReportDataLogs;
	CompileLogs: ReportDataLogs;
	Usage: ReportDataUsage;
	Tests: ReportDataTest[];
	Points?: number;
	Defense?: number;
};

export type Report = {
	ID: number;
	SolutionID: number;
	Verdict: number;
	CreateTime: number;
	Data: ReportData;
};

export type Solution = {
	ID: number;
	ProblemID: number;
	ContestID?: number;
	CompilerID: number;
	UserID: number;
	User?: User;
	Problem?: Problem;
	SourceCode: string;
	CreateTime: number;
	Report?: Report;
};

export type SolutionsResp = {
	solutions?: Solution[];
};

export const RUNNING: number = -1;
export const QUEUED: number = 0;
export const ACCEPTED: number = 1;
export const COMPILATION_ERROR: number = 2;
export const TIME_LIMIT_EXCEEDED: number = 3;
export const MEMORY_LIMIT_EXCEEDED: number = 4;
export const RUNTIME_ERROR: number = 5;
export const WRONG_ANSWER: number = 6;
export const PRESENTATION_ERROR: number = 7;

export const getShortVerdict = (verdict: number) => {
	switch (verdict) {
		case RUNNING:
		case QUEUED:
			return "?";
		case ACCEPTED:
			return "AC";
		case COMPILATION_ERROR:
			return "CE";
		case TIME_LIMIT_EXCEEDED:
			return "TL";
		case MEMORY_LIMIT_EXCEEDED:
			return "ML";
		case RUNTIME_ERROR:
			return "RE";
		case WRONG_ANSWER:
			return "WA";
		case PRESENTATION_ERROR:
			return "PE";
	}
	return "?";
};

export const ACCEPTED_DEFENSE = 1;
export const REJECTED_DEFENSE = 2;
export const DEFENSED = 3;

export const getDefense = (verdict?: number) => {
	if (!verdict) {
		return "Ожидает проверки";
	}
	switch (verdict) {
		case ACCEPTED_DEFENSE:
			return "Допущена к защите";
		case REJECTED_DEFENSE:
			return "Отклонена";
		case DEFENSED:
			return "Принята";
	}
	return "?";
};

export type LoginForm = {
	login: string;
	password: string;
};

export type RegisterForm = {
	login: string;
	password: string;
	email: string;
	first_name?: string;
	last_name?: string;
	middle_name?: string;
};

const HEADERS = {
	"Solve-Web-Version": "0.1.0",
};

const POST_JSON_HEADERS = {
	"Content-Type": "application/json; charset=UTF-8",
};

const parseResp = (promise: Promise<Response>) => {
	return promise
		.then(resp => Promise.all([resp, resp.json()]))
		.then(([resp, json]) => {
			if (!resp.ok) {
				throw json;
			}
			return json;
		});
};

export const loginUser = (form: LoginForm) => {
	return parseResp(fetch("/api/v0/login", {
		method: "POST",
		headers: {...HEADERS, ...POST_JSON_HEADERS},
		body: JSON.stringify(form)
	}));
};

export const registerUser = (form: RegisterForm) => {
	return parseResp(fetch("/api/v0/register", {
		method: "POST",
		headers: {...HEADERS, ...POST_JSON_HEADERS},
		body: JSON.stringify(form),
	}));
};

export const observeUser = (userID: UserID) => {
	return parseResp(fetch(`/api/v0/users/${userID}`, {
		method: "GET",
		headers: HEADERS,
	}));
};

export type UpdateUserForm = {
	first_name?: string;
	last_name?: string;
	middle_name?: string;
};

export const updateUser = (userID: UserID, form: UpdateUserForm) => {
	return parseResp(fetch(`/api/v0/users/${userID}`, {
		method: "PATCH",
		headers: {...HEADERS, ...POST_JSON_HEADERS},
		body: JSON.stringify(form),
	}));
};

export const observeUserSessions = (userID: UserID) => {
	return parseResp(fetch(`/api/v0/users/${userID}/sessions`, {
		method: "GET",
		headers: HEADERS,
	}));
};

export const statusUser = () => {
	return parseResp(fetch("/api/v0/status", {
		method: "GET",
		headers: HEADERS,
	}));
};

export const deleteSession = (sessionID: number) => {
	return parseResp(fetch(`/api/v0/sessions/${sessionID}`, {
		method: "DELETE",
	}));
};

export type UpdatePasswordForm = {
	password: string;
	old_password?: string;
};

export const updateUserPassword = (userID: UserID, form: UpdatePasswordForm) => {
	return parseResp(fetch(`/api/v0/users/${userID}/password`, {
		method: "POST",
		headers: {...HEADERS, ...POST_JSON_HEADERS},
		body: JSON.stringify(form),
	}));
};

export const observeContests = () => {
	return parseResp(fetch(`/api/v0/contests`, {
		method: "GET",
		headers: HEADERS,
	}));
};

export const observeSolutions = () => {
	return parseResp(fetch(`/api/v0/solutions`, {
		method: "GET",
		headers: HEADERS,
	}));
};
