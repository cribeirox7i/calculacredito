import type { EstadoAcao } from "./tipos-acao";

export function MensagemAcao({ estado }: { estado: EstadoAcao }) {
  if (!estado) return null;

  return (
    <p
      className={`mt-3 whitespace-pre-wrap rounded-lg p-3 text-xs ${
        estado.ok
          ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
          : "bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-200"
      }`}
    >
      {estado.mensagem}
    </p>
  );
}
