import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";

function Login() {
	const { login, isAuthenticated } = useAuth();
	const { register, handleSubmit } = useForm();
	const navigate = useNavigate();

	const loginHandler = async (data) => {
		const isSucess = await login({ data });

		if (isSucess)
			navigate('/pages/user');
	}

	return (
		<>
			<form onSubmit={handleSubmit(loginHandler)} className="flex flex-col m-5">
				<label>Email</label>
				<input {...register('email')} className="border" />

				<label>Password</label>
				<input {...register('password')} className="border" />

				<button className="border mt-2">Login</button>
			</form>
		</>
	);
}

export default Login;