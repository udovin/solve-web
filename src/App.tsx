import { FC } from "react";
import { Switch, Route } from "react-router-dom";
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
				<Switch>
					<Route exact path="/" component={IndexPage} />
					<Route exact path="/contests" component={ContestsPage} />
					<Route exact path="/contests/create" component={CreateContestPage} />
					<Route path="/contests/:contest_id" component={ContestPage} />
					<Route exact path="/problems" component={ProblemsPage} />
					<Route exact path="/problems/create" component={CreateProblemPage} />
					<Route exact path="/solutions" component={SolutionsPage} />
					<Route exact path="/solutions/:solution_id" component={SolutionPage} />
					<Route exact path="/compilers/create" component={CreateCompilerPage} />
					<Route exact path="/login" component={LoginPage} />
					<Route exact path="/logout" component={LogoutPage} />
					<Route exact path="/register" component={RegisterPage} />
					<Route exact path="/users/:user_id" component={UserPage} />
					<Route exact path="/users/:user_id/edit" component={EditUserPage} />
					<Route exact path="/language" component={LanguagePage} />
					<Route component={NotFoundPage} />
				</Switch>
				<Footer />
			</AuthProvider>
		</div>
	);
};

export default App;
