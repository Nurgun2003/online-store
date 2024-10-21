import './Login.css';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { fetchUserData } from '../../Account';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const { register, handleSubmit, setError, formState: { errors } } = useForm();
    const [ isLoading, setLoading ] = useState(false);
    const navigate = useNavigate();
    const onSubmit = async (data) => {
        setLoading(true);
        try {
            console.log(data);
            const response = await fetch("/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                },
                body: JSON.stringify(data)
            });
            if(response.ok) {
                const { userid } = await response.json();
                const { password } = data;
                fetchUserData({ userid, password });
                navigate("/");
            }
            else {
                if(response.status === 403) {
                    setError("submit", { type: "manual", message: "Неверный логин или пароль" })
                }
                else {
                    setError("submit", { type: "manual", message: `Ошибка входа: ${response.statusText}.\nПовторите попытку позже.` });
                }
            }
        }
        catch(e) {
            setError("submit", { type: "manual", message: "Сервер недоступен.\nПовторите попытку позже." });
        }
        setLoading(false);
    }
    return (
        <div>
            <h1>Вход</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
                <p>
                    <label for="login">Телефон или Email</label><br />
                    <input
                        type="text"
                        id="login"
                        name="login"
                        required
                        {...register("login")}
                    />
                </p>
                <p>
                    <label for="password">Пароль</label><br />
                    <input
                        type="password"
                        id="password"
                        name="password"
                        required
                        {...register("password")}
                    />
                </p>
                <p>
                    <input
                        type="submit"
                        value="Войти"
                        disabled={isLoading}
                        {...register("submit")}
                    />
                    <a href="/register">Зарегистрироваться</a>
                    {errors.submit && <p>{errors.submit.message}</p>}
                </p>
            </form>
        </div>
    );
}