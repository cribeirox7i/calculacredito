import { FormTrocarSenha } from "./FormTrocarSenha";

export function SecaoSenha() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Trocar senha de acesso
      </h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        A nova senha vale só pra este painel de administração - não afeta
        nada mais no site. Guarde bem, não tem recuperação por e-mail.
      </p>

      <div className="mt-6">
        <FormTrocarSenha />
      </div>
    </div>
  );
}
