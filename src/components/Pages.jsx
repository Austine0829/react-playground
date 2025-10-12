import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Pages({ allowedRole }) {
	const { isAuthenticated, role, isLoading } = useAuth();

	if (isLoading) return <div>Loading...</div>;

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