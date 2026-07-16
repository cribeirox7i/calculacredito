"use server";

import { revalidatePath } from "next/cache";
import { definirSenhaAdmin, verificarSenhaAdmin } from "@/lib/admin-senha";

export async function trocarSenha(formData: FormData) {
  const senhaAtual = String(formData.get("senhaAtual") ?? "");
  const novaSenha = String(formData.get("novaSenha") ?? "");
  const confirmacaoSenha = String(formData.get("confirmacaoSenha") ?? "");

  if (!(await verificarSenhaAdmin(senhaAtual))) {
    throw new Error("Senha atual incorreta.");
  }
  if (novaSenha.length < 8) {
    throw new Error("A nova senha precisa ter pelo menos 8 caracteres.");
  }
  if (novaSenha !== confirmacaoSenha) {
    throw new Error("A confirmação não bate com a nova senha.");
  }

  await definirSenhaAdmin(novaSenha);
  revalidatePath("/admin");
}
