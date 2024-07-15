// app/login/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {userExists, registerUser } from '@/lib/api';
import { FormData } from "@/lib/types";

const LoginRegister = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
    const router = useRouter();
    const [isRegistering, setIsRegistering] = useState(false);
    const [userExistsState, setUserExists] = useState(false);
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const checkUser = async () => {
            try {
                const data = await userExists();
                setUserExists(data.user_exists);
                setLoading(false);
            } catch (error) {
                console.error('Error checking user existence:', error);
                setLoading(false);
            }
        };

        checkUser().catch(error => console.error('Error checking user existence:', error));
    }, []);

    const handleLogin = async (data: FormData) => {
        try {
            console.log('Attempting to login with data:', data);

            const result = await signIn('credentials', {
                redirect: false,
                email: data.email,
                password: data.password,
            });

            if (result?.ok) {
                router.push('/');
            } else {
                console.error('Login failed:', result?.error);
                setErrorMessage('Login failed: Invalid credentials');
            }
        } catch (error) {
            console.error('Login failed:', error);
            setErrorMessage('Login failed: An unexpected error occurred');
        }
    };

    const handleRegister = async (data: FormData) => {
        try {
            const response = await registerUser(data);

            if (response) {
                setSuccessMessage('Registration successful! Redirecting to login...');
                setIsRegistering(false);
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } else {
                setErrorMessage('Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Registration failed:', error);
            setErrorMessage('Registration failed. Please try again.');
        }
    };

    const onSubmit = (data: FormData) => {
        setErrorMessage('');
        setSuccessMessage('');
        if (isRegistering) {
            handleRegister(data);
        } else {
            handleLogin(data);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center mt-6">
                <div className="loader border-t-4 border-b-4 border-blue-500 w-52 h-52 rounded-full animate-spin mt-48"></div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4 bg-gray-700 mt-4 mb-4 rounded">
            <h1 className="text-4xl font-bold mb-8 text-white">
                {isRegistering ? 'Register' : 'Login'}
            </h1>
            {successMessage && (
                <div className="bg-green-500 text-white p-4 rounded mb-4">
                    {successMessage}
                </div>
            )}
            {errorMessage && (
                <div className="bg-red-500 text-white p-4 rounded mb-4">
                    {errorMessage}
                </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-800 p-4 rounded">
                <div className="mb-4">
                    <label className="block text-white text-sm font-bold mb-2" htmlFor="email">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        {...register('email', { required: 'Email is required' })}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-2">{errors.email.message}</p>}
                </div>
                <div className="mb-4">
                    <label className="block text-white text-sm font-bold mb-2" htmlFor="password">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        {...register('password', { required: 'Password is required' })}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
                    />
                    {errors.password && <p className="text-red-500 text-xs mt-2">{errors.password.message}</p>}
                </div>
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    {isRegistering ? 'Register' : 'Login'}
                </button>
            </form>

            {!userExistsState && !isRegistering && (
                <button
                    onClick={() => setIsRegistering(true)}
                    className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    No account? Register
                </button>
            )}

            {isRegistering && (
                <button
                    onClick={() => setIsRegistering(false)}
                    className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    Already have an account? Login
                </button>
            )}
        </div>
    );
};

export default LoginRegister;
