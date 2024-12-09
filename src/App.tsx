import { FC, Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./ui/Header";
import Footer from "./ui/Footer";
import IndexPage from "./pages/IndexPage";
import NotFoundPage from "./pages/NotFoundPage";

import "./App.scss";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const LogoutPage = lazy(() => import("./pages/LogoutPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ConfirmEmailPage = lazy(() => import("./pages/ConfirmEmailPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const LanguagePage = lazy(() => import("./pages/LanguagePage"));

const UserPage = lazy(() => import("./pages/UserPage"));
const EditUserPage = lazy(() => import("./pages/EditUserPage"));

const ProblemsPage = lazy(() => import("./pages/ProblemsPage"));
const ProblemPage = lazy(() => import("./pages/ProblemPage"));
const CreateProblemPage = lazy(() => import("./pages/CreateProblemPage"));
const EditProblemPage = lazy(() => import("./pages/EditProblemPage"));

const SolutionsPage = lazy(() => import("./pages/SolutionsPage"));
const SolutionPage = lazy(() => import("./pages/SolutionPage"));

const ContestsPage = lazy(() => import("./pages/ContestsPage"));
const ContestPage = lazy(() => import("./pages/ContestPage"));
const CreateContestPage = lazy(() => import("./pages/CreateContestPage"));

const PostPage = lazy(() => import("./pages/PostPage"));
const CreatePostPage = lazy(() => import("./pages/CreatePostPage"));

const CreateCompilerPage = lazy(() => import("./pages/CreateCompilerPage"));

const AdminPage = lazy(() => import("./pages/AdminPage"));

const App: FC = () => {
	return (
		<div id="layout">
			<Header />
			<Suspense>
				<Routes>
					<Route index element={<IndexPage />} />
					<Route path="/contests" element={<ContestsPage />} />
					<Route path="/contests/create" element={<CreateContestPage />} />
					<Route path="/posts/create" element={<CreatePostPage />} />
					<Route path="/posts/:post_id" element={<PostPage />} />
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
			</Suspense>
			<Footer />
		</div>
	);
};

export default App;
