import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Shield } from 'lucide-react';
import Button from '@/Components/ui/Button';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Checkbox from '@/Components/Checkbox';

interface AdminLoginProps {
    status?: string;
}

export default function AdminLogin({ status }: AdminLoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.login.store'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <Head title="Admin Login" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="inline-flex items-center justify-center p-3 bg-blue-600/10 border border-blue-500/20 rounded-xl text-blue-400 mb-4 shadow-inner">
                    <Shield className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white">
                    Administrator Portal
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                    Sign in to manage system users and permissions.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-xl rounded-2xl sm:px-10">
                    {status && (
                        <div className="mb-4 text-sm font-medium text-emerald-400 bg-emerald-950/50 border border-emerald-800 p-3 rounded-lg">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <InputLabel
                                htmlFor="email"
                                value="Admin Email"
                                className="text-slate-300"
                            />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full bg-slate-800/80 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500"
                                autoComplete="username"
                                isFocused={true}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="admin@example.com"
                                required
                            />
                            <InputError message={errors.email} className="mt-1.5" />
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="password"
                                value="Password"
                                className="text-slate-300"
                            />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full bg-slate-800/80 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                            <InputError message={errors.password} className="mt-1.5" />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) =>
                                        setData('remember', e.target.checked)
                                    }
                                    className="border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ms-2 text-xs text-slate-400">
                                    Remember me
                                </span>
                            </label>
                        </div>

                        <div>
                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full justify-center py-2.5 font-semibold shadow-md"
                                isLoading={processing}
                            >
                                Sign in as Administrator
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
