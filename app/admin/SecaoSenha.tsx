import { trocarSenha } from "./actions-senha";

export function SecaoSenha() {
  return (
    <div className="max-w-sm">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Trocar senha de acesso
      </h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        A nova senha vale só pra este painel de administração - não afeta
        nada mais no site. Guarde bem, não tem recuperação por e-mail.
      </p>

      <form
        action={trocarSenha}
        className="mt-6 flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Senha atual
          <input
            type="password"
            name="senhaAtual"
            required
            autoComplete="current-password"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-800"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Nova senha
          <input
            type="password"
            name="novaSenha"
            required
            minLength={8}
            autoComplete="new-password"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-800"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Confirmar nova senha
          <input
            type="password"
            name="confirmacaoSenha"
            required
            minLength={8}
            autoComplete="new-password"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-800"
          />
        </label>
        <button
          type="submit"
          className="mt-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Salvar nova senha
        </button>
      </form>
    </div>
  );
}
