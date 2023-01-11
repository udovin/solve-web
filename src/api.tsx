export type UserID = number | string;

export type ErrorField = {
	message: string;
};

export type ErrorResponse = {
	message: string;
	missing_roles?: string[];
	invalid_fields?: { [key: string]: ErrorField };
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

export type Sessions = {
	sessions?: Session[];
};

export type Status = {
	session?: Session;
	user?: User;
	permissions?: string[];
};

export type ProblemStatementSample = {
	input?: string;
	output?: string;
};

export type ProblemConfig = {
	time_limit?: number;
	memory_limit?: number;
};

export type ProblemStatement = {
	locale: string;
	title?: string;
	legend?: string;
	input?: string;
	output?: string;
	notes?: string;
	samples?: ProblemStatementSample[];
};

export type Problem = {
	id: number;
	title: string;
	config?: ProblemConfig;
	statement?: ProblemStatement;
	permissions?: string[];
};

export type Problems = {
	problems?: Problem[];
};

export type ContestState = {
	stage: string;
	participant?: ContestParticipant;
};

export type Contest = {
	id: number;
	title: string;
	begin_time?: number;
	duration?: number;
	permissions?: string[];
	enable_upsolving?: boolean;
	enable_registration?: boolean;
	state?: ContestState;
};

export type Contests = {
	contests?: Contest[];
};

export type CompilerConfig = {
	language?: string;
	compiler?: string;
	extensions?: string[];
};

export type Compiler = {
	id: number;
	name: string;
	config?: CompilerConfig;
};

export type Compilers = {
	compilers?: Compiler[];
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
	id: number;
	content?: string;
	report?: SolutionReport;
	user?: User;
	problem?: Problem;
	create_time: number;
	// deprecated.
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

export type Solutions = {
	solutions?: Solution[];
};

export type ContestProblem = Problem & {
	code: string;
	contest_id: number;
};

export type ContestProblems = {
	problems?: ContestProblem[];
};

export type ContestParticipant = {
	id?: number;
	user?: User;
	kind: string;
};

export type ContestParticipants = {
	participants?: ContestParticipant[];
};

export type TestReport = {
	verdict: string;
	used_time?: number;
	used_memory?: number;
	check_log?: string;
};

export type SolutionReport = {
	verdict: string;
	points?: number;
	tests?: TestReport[];
	used_time?: number;
	used_memory?: number;
};

export type ContestSolution = {
	id: number;
	content?: string;
	report?: SolutionReport;
	participant?: ContestParticipant;
	problem?: ContestProblem;
	compiler?: Compiler;
	create_time: number;
};

export type ContestSolutions = {
	solutions?: ContestSolution[];
};

export type Setting = {
	id: number;
	key: string;
	value: string;
};

export type Settings = {
	settings?: Setting[];
};

export type Role = {
	id: number;
	name: string;
	built_in?: boolean;
};

export type Roles = {
	roles?: Role[];
};

export type RoleRoles = {
	roles?: Role[];
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

let fetchActuality = Date.now();

const getHeaders = () => {
	let headers = {
		"X-Solve-Web-Version": "0.1.0",
		"X-Solve-Sync": (Date.now() < fetchActuality ? "1" : "0"),
	};
	return headers;
};

const POST_JSON_HEADERS = {
	"Content-Type": "application/json; charset=UTF-8",
};

const parseResp = (promise: Promise<Response>, syncFetch: boolean = false) => {
	return promise
		.then(resp => Promise.all([resp, resp.json()]))
		.then(([resp, json]) => {
			if (!resp.ok) {
				throw json;
			}
			if (syncFetch) {
				fetchActuality = Date.now() + 3000;
			}
			return json;
		});
};

export const loginUser = (form: LoginForm) => {
	return parseResp(fetch("/api/v0/login", {
		method: "POST",
		headers: { ...getHeaders(), ...POST_JSON_HEADERS },
		body: JSON.stringify(form)
	}), true);
};

export const registerUser = (form: RegisterForm) => {
	return parseResp(fetch("/api/v0/register", {
		method: "POST",
		headers: { ...getHeaders(), ...POST_JSON_HEADERS },
		body: JSON.stringify(form),
	}));
};

export const observeUser = (userID: UserID) => {
	return parseResp(fetch(`/api/v0/users/${userID}`, {
		method: "GET",
		headers: getHeaders(),
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
		headers: { ...getHeaders(), ...POST_JSON_HEADERS },
		body: JSON.stringify(form),
	}));
};

export const observeUserSessions = (userID: UserID) => {
	return parseResp(fetch(`/api/v0/users/${userID}/sessions`, {
		method: "GET",
		headers: getHeaders(),
	}));
};

export const statusUser = () => {
	return parseResp(fetch("/api/v0/status", {
		method: "GET",
		headers: getHeaders(),
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
		headers: { ...getHeaders(), ...POST_JSON_HEADERS },
		body: JSON.stringify(form),
	}));
};

export const observeContest = (id: number) => {
	return parseResp(fetch(`/api/v0/contests/${id}`, {
		method: "GET",
		headers: getHeaders(),
	}));
};

export const registerContest = (id: number) => {
	return parseResp(fetch(`/api/v0/contests/${id}/register`, {
		method: "POST",
		headers: getHeaders(),
	}));
};

export const observeContests = () => {
	return parseResp(fetch(`/api/v0/contests`, {
		method: "GET",
		headers: getHeaders(),
	}));
};

export type CreateContestForm = {
	title: string;
	begin_time?: number;
	duration?: number;
	enable_registration?: boolean;
	enable_upsolving?: boolean;
};

export const createContest = (form: CreateContestForm) => {
	return parseResp(fetch(`/api/v0/contests`, {
		method: "POST",
		headers: { ...getHeaders(), ...POST_JSON_HEADERS },
		body: JSON.stringify(form),
	}), true);
};

export type UpdateContestForm = {
	title?: string;
	begin_time?: number;
	duration?: number;
	enable_registration?: boolean;
	enable_upsolving?: boolean;
};

export const updateContest = (id: number, form: UpdateContestForm) => {
	return parseResp(fetch(`/api/v0/contests/${id}`, {
		method: "PATCH",
		headers: { ...getHeaders(), ...POST_JSON_HEADERS },
		body: JSON.stringify(form),
	}));
};

export const deleteContest = (id: number) => {
	return parseResp(fetch(`/api/v0/contests/${id}`, {
		method: "DELETE",
		headers: getHeaders(),
	}));
};

export const observeSolutions = () => {
	return parseResp(fetch(`/api/v0/solutions`, {
		method: "GET",
		headers: getHeaders(),
	}));
};

export const observeSolution = (id: number) => {
	return parseResp(fetch(`/api/v0/solutions/${id}`, {
		method: "GET",
		headers: getHeaders(),
	}));
};

export const observeContestProblems = (id: number) => {
	return parseResp(fetch(`/api/v0/contests/${id}/problems`, {
		method: "GET",
		headers: getHeaders(),
	}));
};

export type CreateContestProblemForm = {
	code: string;
	problem_id: number;
};

export const createContestProblem = (contestID: number, form: CreateContestProblemForm) => {
	return parseResp(fetch(`/api/v0/contests/${contestID}/problems`, {
		method: "POST",
		headers: { ...getHeaders(), ...POST_JSON_HEADERS },
		body: JSON.stringify(form),
	}));
};

export const deleteContestProblem = (contestID: number, code: string) => {
	return parseResp(fetch(`/api/v0/contests/${contestID}/problems/${code}`, {
		method: "DELETE",
		headers: getHeaders(),
	}));
};

export const observeContestParticipants = (id: number) => {
	return parseResp(fetch(`/api/v0/contests/${id}/participants`, {
		method: "GET",
		headers: getHeaders(),
	}));
};

export type CreateContestParticipantForm = {
	user_id: number;
	user_login: string;
	kind: string;
};

export const createContestParticipant = (contestID: number, form: CreateContestParticipantForm) => {
	return parseResp(fetch(`/api/v0/contests/${contestID}/participants`, {
		method: "POST",
		headers: { ...getHeaders(), ...POST_JSON_HEADERS },
		body: JSON.stringify(form),
	}));
};

export const deleteContestParticipant = (contestID: number, participantID: number) => {
	return parseResp(fetch(`/api/v0/contests/${contestID}/participants/${participantID}`, {
		method: "DELETE",
		headers: getHeaders(),
	}));
};

export const observeProblems = () => {
	return parseResp(fetch(`/api/v0/problems`, {
		method: "GET",
		headers: getHeaders(),
	}));
};

export const observeProblem = (id: number) => {
	return parseResp(fetch(`/api/v0/problems/${id}`, {
		method: "GET",
		headers: getHeaders(),
	}));
};

export const observeCompilers = () => {
	return parseResp(fetch(`/api/v0/compilers`, {
		method: "GET",
		headers: getHeaders(),
	}));
};

export type CreateProblemForm = {
	title: string;
	file: File;
};

export const createProblem = (form: CreateProblemForm) => {
	const formData = new FormData();
	formData.append("title", form.title);
	formData.append("file", form.file, form.file.name);
	return parseResp(fetch(`/api/v0/problems`, {
		method: "POST",
		headers: getHeaders(),
		body: formData,
	}), true);
};

export type UpdateProblemForm = {
	title?: string;
	file?: File;
};

export const updateProblem = (id: number, form: UpdateProblemForm) => {
	const formData = new FormData();
	if (form.title) {
		formData.append("title", form.title);
	}
	if (form.file) {
		formData.append("file", form.file, form.file.name);
	}
	return parseResp(fetch(`/api/v0/problems/${id}`, {
		method: "PATCH",
		headers: getHeaders(),
		body: formData,
	}));
};

type RebuildProblemForm = {
	compile?: boolean;
};

export const rebuildProblem = (id: number, form: RebuildProblemForm) => {
	return parseResp(fetch(`/api/v0/problems/${id}/rebuild`, {
		method: "POST",
		headers: { ...getHeaders(), ...POST_JSON_HEADERS },
		body: JSON.stringify(form),
	}));
};

export type SubmitContestSolution = {
	compiler_id: number;
	file: File;
};

export const submitContestSolution = (
	contestID: number, problemCode: string, form: SubmitContestSolution,
) => {
	const formData = new FormData();
	formData.append("compiler_id", String(form.compiler_id));
	formData.append("file", form.file, form.file.name);
	return parseResp(fetch(
		`/api/v0/contests/${contestID}/problems/${problemCode}/submit`,
		{
			method: "POST",
			headers: getHeaders(),
			body: formData,
		},
	), true);
};

export const observeContestSolutions = (id: number) => {
	return parseResp(fetch(`/api/v0/contests/${id}/solutions`, {
		method: "GET",
		headers: getHeaders(),
	}));
};

export const observeContestSolution = (id: number, solutionID: number) => {
	return parseResp(fetch(`/api/v0/contests/${id}/solutions/${solutionID}`, {
		method: "GET",
		headers: getHeaders(),
	}));
};

export const observeSettings = () => {
	return parseResp(fetch(`/api/v0/settings`, {
		method: "GET",
		headers: getHeaders(),
	}));
};

export type CreateSettingForm = {
	key: string;
	value: string;
};

export const createSetting = (form: CreateSettingForm) => {
	return parseResp(fetch(`/api/v0/settings`, {
		method: "POST",
		headers: { ...getHeaders(), ...POST_JSON_HEADERS },
		body: JSON.stringify(form),
	}), true);
};

export const deleteSetting = (id: number) => {
	return parseResp(fetch(`/api/v0/settings/${id}`, {
		method: "DELETE",
		headers: getHeaders(),
	}), true);
};

export const observeRoles = () => {
	return parseResp(fetch(`/api/v0/roles`, {
		method: "GET",
		headers: getHeaders(),
	}));
};

export type CreateRoleForm = {
	name: string;
};

export const createRole = (form: CreateRoleForm) => {
	return parseResp(fetch(`/api/v0/roles`, {
		method: "POST",
		headers: { ...getHeaders(), ...POST_JSON_HEADERS },
		body: JSON.stringify(form),
	}), true);
};

export const deleteRole = (id: number) => {
	return parseResp(fetch(`/api/v0/roles/${id}`, {
		method: "DELETE",
		headers: getHeaders(),
	}), true);
};

export const observeRoleRoles = (id: number) => {
	return parseResp(fetch(`/api/v0/roles/${id}/roles`, {
		method: "GET",
		headers: getHeaders(),
	}));
};

export const createRoleRole = (id: number, childID: number | string) => {
	return parseResp(fetch(`/api/v0/roles/${id}/roles/${childID}`, {
		method: "POST",
		headers: getHeaders(),
	}), true);
};

export const deleteRoleRole = (id: number, childID: number) => {
	return parseResp(fetch(`/api/v0/roles/${id}/roles/${childID}`, {
		method: "DELETE",
		headers: getHeaders(),
	}), true);
};
