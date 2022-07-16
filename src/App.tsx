import { FC } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.scss";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import IndexPage from "./pages/IndexPage";
import LanguagePage from "./pages/LanguagePage";
import { AuthProvider } from "./AuthContext";
import CreateProblemPage from "./pages/CreateProblemPage";
import ProblemsPage from "./pages/ProblemsPage";
import ContestsPage from "./pages/ContestsPage";
import CreateContestPage from "./pages/CreateContestPage";
import ContestPage from "./pages/ContestPage";
import CreateCompilerPage from "./pages/CreateCompilerPage";
import LogoutPage from "./pages/LogoutPage";
import UserPage from "./pages/UserPage";
import EditUserPage from "./pages/EditUserPage";
import NotFoundPage from "./pages/NotFoundPage";
import SolutionsPage from "./pages/SolutionsPage";
import SolutionPage from "./pages/SolutionPage";

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
					<Route path="/problems/create" element={<CreateProblemPage />} />
					<Route path="/solutions" element={<SolutionsPage />} />
					<Route path="/solutions/:solution_id" element={<SolutionPage />} />
					<Route path="/compilers/create" element={<CreateCompilerPage />} />
					<Route path="/login" element={<LoginPage />} />
					<Route path="/logout" element={<LogoutPage />} />
					<Route path="/register" element={<RegisterPage />} />
					<Route path="/users/:user_id" element={<UserPage />} />
					<Route path="/users/:user_id/edit" element={<EditUserPage />} />
					<Route path="/language" element={<LanguagePage />} />
					<Route path="*" element={<NotFoundPage />} />
				</Routes>
				<Footer />
			</AuthProvider>
		</div>
	);
};

export default App;
