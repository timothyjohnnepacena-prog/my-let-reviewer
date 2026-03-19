import { login, signup } from './actions'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const params = await searchParams

    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white p-8 shadow-sm border rounded-lg">
                <h2 className="mt-4 text-center text-3xl font-bold tracking-tight text-gray-900">
                    Account Access
                </h2>

                {params.error && (
                    <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded">
                        {params.error}
                    </div>
                )}

                <form className="mt-8 space-y-6">
                    <div className="space-y-4 rounded-md shadow-sm">
                        <input id="email" name="email" type="email" required className="relative block w-full rounded-md border-0 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3" placeholder="Email address" />
                        <input id="password" name="password" type="password" required className="relative block w-full rounded-md border-0 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3" placeholder="Password" />
                    </div>
                    <div className="flex flex-col gap-3">
                        <button formAction={login} className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
                            Sign in
                        </button>
                        <button formAction={signup} className="flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors">
                            Sign up
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}