import { LoginForm } from './login-form'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const params = await searchParams;
  return (
    <div className="flex h-screen w-full items-center justify-center p-4">
      <LoginForm message={params?.message} />
    </div>
  )
}
