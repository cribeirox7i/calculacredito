import { login } from "./actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;

  return (
    <main className="mx-auto flex max-w-sm flex-col gap-4 px-4 py-24 sm:px-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Administração
      </h1>
      <form action={login} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Senha
          <input
            type="password"
            name="senha"
            required
            autoFocus
            className="rounded-lg border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-800"
          />
        </label>
        {erro && (
          <p className="text-sm text-red-600 dark:text-red-400">Senha incorreta.</p>
        )}
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Entrar
        </button>
      </form>
    </main>
  );
}
