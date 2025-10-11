import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Pages({ allowedRole }) {
	const { isAuthenticated, role } = useAuth();

	if (!isAuthenticated)
		return <Navigate to={'/login'} />

	if (role !== allowedRole)
		return <Navigate to={'/unauthorized'} />

	return (
		<>
			<Outlet />
		</>
	);
}

export default Pages;