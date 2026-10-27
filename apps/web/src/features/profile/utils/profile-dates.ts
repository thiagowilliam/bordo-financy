import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

/** "março de 2026" for the "No Bordo desde" line. */
export const formatMemberSince = (createdAt: string) =>
  format(parseISO(createdAt), "MMMM 'de' yyyy", { locale: ptBR });
