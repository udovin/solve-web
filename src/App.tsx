import { FC } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import loadable from "@loadable/component";
import Header from "./ui/Header";
import Footer from "./ui/Footer";
import IndexPage from "./pages/IndexPage";
import LoginPage from "./pages/LoginPage";
import LogoutPage from "./pages/LogoutPage";
import RegisterPage from "./pages/RegisterPage";
import LanguagePage from "./pages/LanguagePage";
import ConfirmEmailPage from "./pages/ConfirmEmailPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFoundPage from "./pages/NotFoundPage";
import "./App.scss";

const ProblemsPage = loadable(() => import("./pages/ProblemsPage"));
const ProblemPage = loadable(() => import("./pages/ProblemPage"));
const CreateProblemPage = loadable(() => import("./pages/CreateProblemPage"));
const EditProblemPage = loadable(() => import("./pages/EditProblemPage"));
const ContestsPage = loadable(() => import("./pages/ContestsPage"));
const ContestPage = loadable(() => import("./pages/ContestPage"));
const CreateContestPage = loadable(() => import("./pages/CreateContestPage"));
const CreateCompilerPage = loadable(() => import("./pages/CreateCompilerPage"));
const UserPage = loadable(() => import("./pages/UserPage"));
const EditUserPage = loadable(() => import("./pages/EditUserPage"));
const SolutionsPage = loadable(() => import("./pages/SolutionsPage"));
const SolutionPage = loadable(() => import("./pages/SolutionPage"));
const AdminPage = loadable(() => import("./pages/AdminPage"));

const App: FC = () => {
	return (
		<div id="layout">
			<AuthProvider>
				<Header />
				<Routes>
					<Route index element={<IndexPage />} />
					<Route path="/contests" element={<ContestsPage />} />
					<Route path="/contests/create" element={<CreateContestPage />} />
					<Route path="/contests/:contest_id/*" element={<ContestPage />} />
					<Route path="/problems" element={<ProblemsPage />} />
					<Route path="/problems/:problem_id" element={<ProblemPage />} />
					<Route path="/problems/:problem_id/edit" element={<EditProblemPage />} />
					<Route path="/problems/create" element={<CreateProblemPage />} />
					<Route path="/solutions" element={<SolutionsPage />} />
					<Route path="/solutions/:solution_id" element={<SolutionPage />} />
					<Route path="/compilers/create" element={<CreateCompilerPage />} />
					<Route path="/login" element={<LoginPage />} />
					<Route path="/login/:scope_id" element={<LoginPage />} />
					<Route path="/logout" element={<LogoutPage />} />
					<Route path="/register" element={<RegisterPage />} />
					<Route path="/users/:user_id" element={<UserPage />} />
					<Route path="/users/:user_id/edit/*" element={<EditUserPage />} />
					<Route path="/language" element={<LanguagePage />} />
					<Route path="/confirm-email" element={<ConfirmEmailPage />} />
					<Route path="/reset-password" element={<ResetPasswordPage />} />
					<Route path="/admin/*" element={<AdminPage />} />
					<Route path="*" element={<NotFoundPage />} />
				</Routes>
				<Footer />
			</AuthProvider>
		</div>
	);
};

export default App;
