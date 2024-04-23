export type UserID = number | string;

export type ErrorField = {
	message: string;
};

export type ErrorResponse = {
	message: string;
	missing_permissions?: string[];
	invalid_fields?: { [key: string]: ErrorField };
};

export type User = {
	id: number;
	login: string;
	status?: string;
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
	scope_user?: ScopeUser;
	permissions?: string[];
	locale?: string;
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
	scoring?: string;
	interaction?: string;
	samples?: ProblemStatementSample[];
};

export type ProblemTask = {
	status?: string;
	error?: string;
};

export type Problem = {
	id: number;
	title: string;
	config?: ProblemConfig;
	statement?: ProblemStatement;
	permissions?: string[];
	last_task?: ProblemTask;
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
	enable_observing?: boolean;
	enable_registration?: boolean;
	freeze_begin_duration?: number;
	freeze_end_time?: number;
	state?: ContestState;
	standings_kind?: string;
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

export type Solution = {
	id: number;
	content?: string;
	report?: SolutionReport;
	user?: User;
	problem?: Problem;
	create_time: number;
	compiler?: Compiler;
};

export type Solutions = {
	solutions?: Solution[];
};

export type ContestProblem = {
	id: number;
	problem: Problem;
	contest_id?: number;
	code: string;
	points?: number;
	locales?: string[];
	solved?: boolean;
};

export type ContestProblems = {
	problems?: ContestProblem[];
};

export type ContestParticipant = {
	id?: number;
	user?: User;
	scope_user?: ScopeUser;
	kind: string;
};

export type ContestParticipants = {
	participants?: ContestParticipant[];
};

export type ContestStandingsColumn = {
	code?: string;
	points?: number;
	total_solutions?: number;
	accepted_solutions?: number;
};

export type ContestStandingsCell = {
	column: number;
	verdict?: string;
	points?: number;
	attempt?: number;
	time?: number;
};

export type ContestStandingsRow = {
	participant?: ContestParticipant;
	score?: number;
	penalty?: number;
	place?: number;
	cells?: ContestStandingsCell[];
};

export type ContestStandings = {
	kind: string;
	columns?: ContestStandingsColumn[];
	rows?: ContestStandingsRow[];
	frozen?: boolean;
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
	test_number?: number;
};

export type ContestSolution = {
	id: number;
	solution: Solution;
	contest_id?: number;
	participant?: ContestParticipant;
	problem?: ContestProblem;
};

export type ContestSolutions = {
	solutions?: ContestSolution[];
	next_begin_id?: number;
};

export type ContestMessage = {
	id: number;
	parent_id?: number;
	title?: string;
	description?: string;
	kind: string;
	participant?: ContestParticipant;
};

export type ContestMessages = {
	messages?: ContestMessage[];
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

export type Scope = {
	id: number;
	title: string;
};

export type Scopes = {
	scopes?: Scope[];
};

export type ScopeUser = {
	id: number;
	login: string;
	title?: string;
	password?: string;
};

export type ScopeUsers = {
	users?: ScopeUser[];
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
	scope_id?: number;
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

export const getLocale = () => {
	if (typeof window !== 'undefined') {
		return localStorage.getItem("locale") ?? "en";
	}
	return "en";
};

// Note: cannot be called from server side.
export const setLocale = (locale: string) => {
	localStorage.setItem("locale", locale);
};

let fetchActuality = Date.now();

// Note: cannot be called from server side.
const getHeaders = () => {
	let headers: Record<string, string> = {
		"X-Solve-Web-Version": "0.0.1",
		"X-Solve-Sync": (Date.now() < fetchActuality ? "1" : "0"),
	};
	const locale = localStorage.getItem("locale");
	if (locale) {
		headers["Accept-Language"] = locale;
	}
	return headers;
};

const POST_JSON_HEADERS = {
	"Content-Type": "application/json; charset=UTF-8",
};

export const BASE = process.env.PUBLIC_URL ?? "";
export const VERSION = process.env.REACT_APP_VERSION ?? "development";

let solveVersion: string | null = null;

export const getSolveVersion = () => {
	return solveVersion;
};

const parseResp = <T = any>(promise: Promise<Response>, syncFetch: boolean = false) => {
	return promise
		.then(resp => Promise.all([resp, resp.json()]))
		.then(([resp, json]): T => {
			if (!resp.ok) {
				throw json;
			}
			if (syncFetch) {
				fetchActuality = Date.now() + 3000;
			}
			solveVersion = resp.headers.get("X-Solve-Version");
			return json;
		});
};

export const loginUser = (form: LoginForm) => {
	return parseResp(fetch(`${BASE}/api/v0/login`, {
		method: "POST",
		headers: { ...getHeaders(), ...POST_JSON_HEADERS },
		body: JSON.stringify(form)
	}), true);
};

export const logoutUser = () => {
	return fetch(`${BASE}/api/v0/logout`, {
		method: "POST",
		headers: { ...getHeaders(), ...POST_JSON_HEADERS },
	}).then(() => {
		fetchActuality = Date.now() + 3000;
	});
};

export const registerUser = (form: RegisterForm) => {
	return parseResp(fetch(`${BASE}/api/v0/register`, {
		method: "POST",
		headers: { ...getHeaders(), ...POST_JSON_HEADERS },
		body: JSON.stringify(form),
	}));
};

export const observeUser = (userID: UserID) => {
	return parseResp(fetch(`${BASE}/api/v0/users/${userID}`, {
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
	return parseResp(fetch(`${BASE}/api/v0/users/${userID}`, {
		method: "PATCH",
		headers: { ...getHeaders(), ...POST_JSON_HEADERS },
		body: JSON.stringify(form),
	}));
};

export const observeUserSessions = (userID: UserID) => {
	return parseResp(fetch(`${BASE}/api/v0/users/${userID}/sessions`, {
		method: "GET",
		headers: getHeaders(),
	}));
};

export const statusUser = () => {
	return parseResp(fetch(`${BASE}/api/v0/status`, {
		method: "GET",
		headers: getHeaders(),
	}));
};

export const deleteSession = (sessionID: number) => {
	return parseResp(fetch(`${BASE}/api/v0/sessions/${sessionID}`, {
		method: "DELETE",
	}));
};

export type UpdatePasswordForm = {
	password: string;
	current_password: string;
};

export const updateUserPassword = (userID: UserID, form: UpdatePasswordForm) => {
	return parseResp(fetch(`${BASE}/api/v0/users/${userID}/password`, {
		method: "POST",
		headers: { ...getHeaders(), ...POST_JSON_HEADERS },
		body: JSON.stringify(form),
	}));
};

export type UpdateEmailForm = {
	email: string;
	current_password: string;
};

export const updateUserEmail = (userID: UserID, form: UpdateEmailForm) => {
	return parseResp(fetch(`${BASE}/api/v0/users/${userID}/email`, {
		method: "POST",
		headers: { ...getHeaders(), ...POST_JSON_HEADERS },
		body: JSON.stringify(form),
	}));
};

export const resendUserEmail = (userID: UserID) => {
	return parseResp(fetch(`${BASE}/api/v0/users/${userID}/email-resend`, {
		method: "POST",
		headers: getHeaders(),
	}));
};

export type ResetPasswordForm = {
	login: string;
};

export const resetUserPassword = (form: ResetPasswordForm) => {
	return parseResp(fetch(`${BASE}/api/v0/password-reset`, {
		method: "POST",
		headers: { ...getHeaders(), ...POST_JSON_HEADERS },
		body: JSON.stringify(form),
	}));
};

export const observeContest = (id: number) => {
	return parseResp(fetch(`${BASE}/api/v0/contests/${id}`, {
		method: "GET",
		headers: getHeaders(),
	}));
};

export const registerContest = (id: number) => {
	return parseResp(fetch(`${BASE}/api/v0/contests/${id}/register`, {
		method: "POST",
		headers: getHeaders(),
	}));
};

export const observeContests = () => {
	return parseResp(fetch(`${BASE}/api/v0/contests`, {
		method: "GET",
		headers: getHeaders(),
	}));
};

export const confirmEmail = (id: string, secret: string) => {
	return parseResp(fetch(`${BASE}/api/v0/tokens/${id}`, {
		method: "POST",
		headers: { ...getHeaders(), ...POST_JSON_HEADERS },
		body: JSON.stringify({ secret: secret }),
	}), true);
};

export const confirmPassword = (id: string, secret: string, password: string) => {
	return parseResp(fetch(`${BASE}/api/v0/tokens/${id}`, {
		method: "POST",
		headers: { ...getHeaders(), ...POST_JSON_HEADERS },
		body: JSON.stringify({ secret: secret, password: password }),
	}), true);
};

export type CreateContestForm = {
	title: string;
	begin_time?: number;
	duration?: number;
	enable_registration?: boolean;
	enable_upsolving?: boolean;
	enable_observing?: boolean;
	freeze_begin_duration?: number;
	freeze_end_time?: number;
	standings_kind?: string;
};

export const createContest = (form: CreateContestForm) => {
	return parseResp(fetch(`${BASE}/api/v0/contests`, {
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
	enable_observing?: boolean;
	freeze_begin_duration?: number;
	freeze_end_time?: number;
	standings_kind?: string;
};

export const updateContest = (id: number, form: UpdateContestForm) => {
	return parseResp(fetch(`${BASE}/api/v0/contests/${id}`, {
		method: "PATCH",
		headers: { ...getHeaders(), ...POST_JSON_HEADERS },
		body: JSON.stringify(form),
	}));
};

export const deleteContest = (id: number) => {
	return parseResp(fetch(`${BASE}/api/v0/contests/${id}`, {
		method: "DELETE",
		headers: getHeaders(),
	}));
};

export const observeSolutions = () => {
	return parseResp(fetch(`${BASE}/api/v0/solutions`, {
		method: "GET",
		headers: getHeaders(),
	}));
};

export const observeSolution = (id: number) => {
	return parseResp(fetch(`${BASE}/api/v0/solutions/${id}`, {
		method: "GET",
		headers: getHeaders(),
	}));
};

export const observeContestProblems = (id: number) => {
	return parseResp<ContestProblems>(fetch(`${BASE}/api/v0/contests/${id}/problems`, {
		method: "GET",
		headers: getHeaders(),
	}));
};

export const observeContestProblem = (id: number, code: string) => {
	return parseResp<ContestProblem>(fetch(`${BASE}/api/v0/contests/${id}/problems/${code}`, {
		method: "GET",
		headers: getHeaders(),
	}));
};

export type CreateContestProblemForm = {
	code: string;
	problem_id: number;
	points?: number;
};

export const createContestProblem = (contestID: number, form: CreateContestProblemForm) => {
	return parseResp(fetch(`${BASE}/api/v0/contests/${contestID}/problems`, {
		method: "POST",
		headers: { ...getHeaders(), ...POST_JSON_HEADERS },
		body: JSON.stringify(form),
	}));
};

export type UpdateContestProblemForm = {
	code: string;
	points?: number;
	locales?: string[];
};

export const updateContestProblem = (contestID: number, code: string, form: UpdateContestProblemForm) => {
	return parseResp(fetch(`${BASE}/api/v0/contests/${contestID}/problems/${code}`, {
		method: "PATCH",
		headers: { ...getHeaders(), ...POST_JSON_HEADERS },
		body: JSON.stringify(form),
	}));
};

export const deleteContestProblem = (contestID: number, code: string) => {
	return parseResp(fetch(`${BASE}/api/v0/contests/${contestID}/problems/${code}`, {
		method: "DELETE",
		headers: getHeaders(),
	}));
};

export const observeContestParticipants = (id: number) => {
	return parseResp(fetch(`${BASE}/api/v0/contests/${id}/participants`, {
		method: "GET",
		headers: getHeaders(),
	}));
};

const encodeQueryData = (query: Record<string, string>) => {
	const result = [];
	for (let key in query) {
		result.push(encodeURIComponent(key) + '=' + encodeURIComponent(query[key]));
	}
	return result.join("&");
};

export const observeContestStandings = (id: number, ignoreFreeze?: boolean, onlyOfficial?: boolean) => {
	const query: Record<string, string> = {};
	if (ignoreFreeze) {
		query["ignore_freeze"] = "t";
	}
	if (onlyOfficial) {
		query["only_official"] = "t";
	}
	const queryString = (ignoreFreeze || onlyOfficial) ? "?" + encodeQueryData(query) : "";
	return parseResp(fetch(`${BASE}/api/v0/contests/${id}/standings${queryString}`, {
		method: "GET",
		headers: getHeaders(),
	}));
};

export type CreateContestParticipantForm = {
	user_id?: number;
	user_login?: string;
	scope_user_id?: number;
	scope_id?: number;
	kind: string;
};

export const createContestParticipant = (contestID: number, form: CreateContestParticipantForm) => {
	return parseResp(fetch(`${BASE}/api/v0/contests/${contestID}/participants`, {
		method: "POST",
		headers: { ...getHeaders(), ...POST_JSON_HEADERS },
		body: JSON.stringify(form),
	}));
};

export const deleteContestParticipant = (contestID: number, participantID: number) => {
	return parseResp(fetch(`${BASE}/api/v0/contests/${contestID}/participants/${participantID}`, {
		method: "DELETE",
		headers: getHeaders(),
	}));
};

export const observeProblems = () => {
	return parseResp(fetch(`${BASE}/api/v0/problems`, {
		method: "GET",
		headers: getHeaders(),
	}));
};

export const observeProblem = (id: number) => {
	return parseResp(fetch(`${BASE}/api/v0/problems/${id}`, {
		method: "GET",
		headers: getHeaders(),
	}));
};

export const observeCompilers = () => {
	return parseResp(fetch(`${BASE}/api/v0/compilers`, {
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
	return parseResp(fetch(`${BASE}/api/v0/problems`, {
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
	return parseResp(fetch(`${BASE}/api/v0/problems/${id}`, {
		method: "PATCH",
		headers: getHeaders(),
		body: formData,
	}));
};

type RebuildProblemForm = {
	compile?: boolean;
};

export const rebuildProblem = (id: number, form: RebuildProblemForm) => {
	return parseResp(fetch(`${BASE}/api/v0/problems/${id}/rebuild`, {
		method: "POST",
		headers: { ...getHeaders(), ...POST_JSON_HEADERS },
		body: JSON.stringify(form),
	}));
};

export type SubmitContestSolution = {
	compiler_id: number;
	file: File | string;
};

export const submitContestSolution = (
	contestID: number, problemCode: string, form: SubmitContestSolution,
) => {
	const formData = new FormData();
	formData.append("compiler_id", String(form.compiler_id));
	if (form.file instanceof File) {
		formData.append("file", form.file, form.file.name);
	} else {
		formData.append("content", form.file);
	}
	return parseResp(fetch(
		`${BASE}/api/v0/contests/${contestID}/problems/${problemCode}/submit`,
		{
			method: "POST",
			headers: getHeaders(),
			body: formData,
		},
	), true);
};

export type ContestSolutionsFilter = {
	problem_id?: number;
	participant_id?: number;
	verdict?: string;
	begin_id?: number;
	limit?: number;
};

export const observeContestSolutions = (id: number, filter: ContestSolutionsFilter = {}) => {
	const query: Record<string, string> = {};
	if (filter.problem_id) {
		query["problem_id"] = `${filter.problem_id}`;
	}
	if (filter.participant_id) {
		query["participant_id"] = `${filter.participant_id}`;
	}
	if (filter.verdict) {
		query["verdict"] = filter.verdict;
	}
	if (filter.begin_id) {
		query["begin_id"] = `${filter.begin_id}`;
	}
	if (filter.limit) {
		query["limit"] = `${filter.limit}`;
	}
	const queryString = encodeQueryData(query);
	return parseResp<ContestSolutions>(fetch(`${BASE}/api/v0/contests/${id}/solutions?${queryString}`, {
		method: "GET",
		headers: getHeaders(),
	}));
};

export const observeContestSolution = (id: number, solutionID: number) => {
	return parseResp<ContestSolution>(fetch(`${BASE}/api/v0/contests/${id}/solutions/${solutionID}`, {
		method: "GET",
		headers: getHeaders(),
	}));
};

export const rejudgeContestSolution = (id: number, solutionID: number) => {
	return parseResp<ContestSolution>(fetch(`${BASE}/api/v0/contests/${id}/solutions/${solutionID}/rejudge`, {
		method: "POST",
		headers: { ...getHeaders(), ...POST_JSON_HEADERS },
		body: JSON.stringify({}),
	}));
};

export const observeSettings = () => {
	return parseResp<Settings>(fetch(`${BASE}/api/v0/settings`, {
		method: "GET",
		headers: getHeaders(),
	}));
};

export type CreateSettingForm = {
	key: string;
	value: string;
};

export const createSetting = (form: CreateSettingForm) => {
	return parseResp<Setting>(fetch(`${BASE}/api/v0/settings`, {
		method: "POST",
		headers: { ...getHeaders(), ...POST_JSON_HEADERS },
		body: JSON.stringify(form),
	}), true);
};

export const deleteSetting = (id: number) => {
	return parseResp<Setting>(fetch(`${BASE}/api/v0/settings/${id}`, {
		method: "DELETE",
		headers: getHeaders(),
	}), true);
};

export const observeRoles = () => {
	return parseResp<Roles>(fetch(`${BASE}/api/v0/roles`, {
		method: "GET",
		headers: getHeaders(),
	}));
};

export type CreateRoleForm = {
	name: string;
};

export const createRole = (form: CreateRoleForm) => {
	return parseResp<Role>(fetch(`${BASE}/api/v0/roles`, {
		method: "POST",
		headers: { ...getHeaders(), ...POST_JSON_HEADERS },
		body: JSON.stringify(form),
	}), true);
};

export const deleteRole = (id: number) => {
	return parseResp<Role>(fetch(`${BASE}/api/v0/roles/${id}`, {
		method: "DELETE",
		headers: getHeaders(),
	}), true);
};

export const observeRoleRoles = (id: number) => {
	return parseResp<RoleRoles>(fetch(`${BASE}/api/v0/roles/${id}/roles`, {
		method: "GET",
		headers: getHeaders(),
	}));
};

export const createRoleRole = (id: number, childID: number | string) => {
	return parseResp<Role>(fetch(`${BASE}/api/v0/roles/${id}/roles/${childID}`, {
		method: "POST",
		headers: getHeaders(),
	}), true);
};

export const deleteRoleRole = (id: number, childID: number) => {
	return parseResp(fetch(`${BASE}/api/v0/roles/${id}/roles/${childID}`, {
		method: "DELETE",
		headers: getHeaders(),
	}), true);
};

export type CreateScopeForm = {
	title: string;
};

export const observeScopes = () => {
	return parseResp<Scopes>(fetch(`${BASE}/api/v0/scopes`, {
		method: "GET",
		headers: getHeaders(),
	}));
};

export const observeScope = (id: number) => {
	return parseResp<Scope>(fetch(`${BASE}/api/v0/scopes/${id}`, {
		method: "GET",
		headers: getHeaders(),
	}));
};

export const createScope = (form: CreateScopeForm) => {
	return parseResp<Scope>(fetch(`${BASE}/api/v0/scopes`, {
		method: "POST",
		headers: { ...getHeaders(), ...POST_JSON_HEADERS },
		body: JSON.stringify(form),
	}), true);
};

export const deleteScope = (id: number) => {
	return parseResp<Scope>(fetch(`${BASE}/api/v0/scopes/${id}`, {
		method: "DELETE",
		headers: getHeaders(),
	}), true);
};

export const observeScopeUsers = (scopeID: number) => {
	return parseResp<ScopeUsers>(fetch(`${BASE}/api/v0/scopes/${scopeID}/users`, {
		method: "GET",
		headers: getHeaders(),
	}));
};

export const observeScopeUser = (scopeID: number, userID: number) => {
	return parseResp<ScopeUser>(fetch(`${BASE}/api/v0/scopes/${scopeID}/users/${userID}`, {
		method: "GET",
		headers: getHeaders(),
	}));
};

export type UpdateScopeUserForm = {
	generate_password?: boolean;
	password?: string;
};

export const updateScopeUser = (scopeID: number, userID: number, form: UpdateScopeUserForm) => {
	return parseResp<ScopeUser>(fetch(`${BASE}/api/v0/scopes/${scopeID}/users/${userID}`, {
		method: "PATCH",
		headers: { ...getHeaders(), ...POST_JSON_HEADERS },
		body: JSON.stringify(form),
	}), true);
};

export type CreateScopeUserForm = {
	login: string;
	title?: string;
};

export const createScopeUser = (scopeID: number, form: CreateScopeUserForm) => {
	return parseResp<ScopeUser>(fetch(`${BASE}/api/v0/scopes/${scopeID}/users`, {
		method: "POST",
		headers: { ...getHeaders(), ...POST_JSON_HEADERS },
		body: JSON.stringify(form),
	}), true);
};

export const deleteScopeUser = (scopeID: number, userID: number) => {
	return parseResp<ScopeUser>(fetch(`${BASE}/api/v0/scopes/${scopeID}/users/${userID}`, {
		method: "DELETE",
		headers: getHeaders(),
	}), true);
};

export const logoutScopeUser = (scopeID: number, userID: number) => {
	return parseResp<ScopeUser>(fetch(`${BASE}/api/v0/scopes/${scopeID}/users/${userID}/logout`, {
		method: "POST",
		headers: getHeaders(),
	}), true);
};

export const observeContestMessages = (contestID: number) => {
	return parseResp<ContestMessages>(fetch(`${BASE}/api/v0/contests/${contestID}/messages`, {
		method: "GET",
		headers: getHeaders(),
	}));
};

export type CreateContestMessage = {
	title?: string;
	description: string;
	parent_id?: number;
};

export const createContestMessage = (contestID: number, form: CreateContestMessage) => {
	return parseResp<ContestMessage>(fetch(`${BASE}/api/v0/contests/${contestID}/messages`, {
		method: "POST",
		headers: { ...getHeaders(), ...POST_JSON_HEADERS },
		body: JSON.stringify(form),
	}), true);
};

export type SubmitContestQuestion = {
	title: string;
	description: string;
};

export const submitContestQuestion = (contestID: number, form: SubmitContestQuestion) => {
	return parseResp<ContestMessage>(fetch(`${BASE}/api/v0/contests/${contestID}/submit-question`, {
		method: "POST",
		headers: { ...getHeaders(), ...POST_JSON_HEADERS },
		body: JSON.stringify(form),
	}), true);
};
