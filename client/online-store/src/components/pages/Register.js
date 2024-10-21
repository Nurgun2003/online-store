import './Register.css';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { fetchUserData } from '../../Account';
import { useNavigate } from 'react-router-dom';

export default function Register() {
    const { register, handleSubmit, setError, formState: { errors } } = useForm();
    const [ isLoading, setLoading ] = useState(false);
    const navigate = useNavigate();
    const onSubmit = async (data) => {
        setLoading(true);
        if(data.password2 === data.password) {
            try {
                const response = await fetch("/users/create", {
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
                        const json = await response.json();
                        if(json.occupiedTelephone) {
                            setError("telephone", { type: "manual", message: "Телефон уже занят" });
                        }
                        if(json.occupiedEmail) {
                            setError("email", { type: "manual", message: "Email уже занят" });
                        }
                    }
                    else
                        setError("submit", { type: "manual", message: `Ошибка регистрации: ${response.statusText}.\nПовторите попытку позже.` });
                }
            }
            catch(e) {
                setError("submit", { type: "manual", message: "Сервер недоступен.\nПовторите попытку позже." });
            }
        }
        else {
            setError("password2", { type: "manual", message: "Пароли не совпадают" });
        }
        setLoading(false);
    }
    return (
        <div>
            <div>
                <h1>Регистрация</h1>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <p>
                        <label for="surname">Фамилия</label><br />
                        <input
                            type="text"
                            id="surname"
                            name="surname"
                            required
                            {...register('surname')}
                        />
                        {errors.surname && <p>{errors.surname.message}</p>}
                    </p>
                    <p>
                        <label for="name">Имя</label><br />
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            {...register('name')}
                        />
                        {errors.name && <p>{errors.name.message}</p>}
                    </p>
                    <p>
                        <label for="telephone">Телефон</label><br />
                        <input
                            type="tel"
                            id="telephone"
                            name="telephone"
                            required
                            {...register('telephone')}
                        />
                        {errors.telephone && <p>{errors.telephone.message}</p>}
                    </p>
                    <p>
                        <label for="email">Email</label><br />
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            {...register('email')}
                        />
                        {errors.email && <p>{errors.email.message}</p>}
                    </p>
                    <p>
                        <label for="password">Пароль</label><br />
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            {...register('password', {
                                minLength: {
                                    value: 8,
                                    message: 'Пароль должен быть не менее 8 символов'
                                }
                            })}
                        />
                        {errors.password && <p>{errors.password.message}</p>}
                    </p>
                    <p>
                        <label for="password2">Повторите пароль</label><br />
                        <input
                            type="password"
                            id="password2"
                            name="password2"
                            required
                            {...register('password2')}
                        />
                        {errors.password2 && <p>{errors.password2.message}</p>}
                    </p>
                    <p>
                        <input
                            type="submit"
                            value="Зарегистрироваться"
                            disabled={isLoading}
                            {...register('submit')}
                        />
                        <a href="/login">У меня уже есть аккаунт</a>
                        {errors.submit && <p>{errors.submit.message}</p>}
                    </p>
                </form>
            </div>
        </div>
    );
}