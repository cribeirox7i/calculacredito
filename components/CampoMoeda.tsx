"use client";

// Máscara de dígitos (padrão BR: 1.234,56) - trata o texto digitado como um
// fluxo de dígitos que vira centavos, formatando a cada tecla. Controlado
// pelo componente pai via `valor` (em reais) + `onChange`.
function formatarCentavos(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function CampoMoeda({
  valor,
  onChange,
  id,
  className,
}: {
  valor: number;
  onChange: (valor: number) => void;
  id?: string;
  className?: string;
}) {
  function lidarComMudanca(e: React.ChangeEvent<HTMLInputElement>) {
    const digitos = e.target.value.replace(/\D/g, "");
    const centavos = digitos === "" ? 0 : parseInt(digitos, 10);
    onChange(centavos / 100);
  }

  return (
    <input
      id={id}
      type="text"
      inputMode="decimal"
      value={formatarCentavos(Math.round(valor * 100))}
      onChange={lidarComMudanca}
      className={className}
    />
  );
}
