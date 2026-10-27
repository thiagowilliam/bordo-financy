export const PASSWORD_RULES = [
  { id: "length", label: "Pelo menos 8 caracteres" },
  { id: "case", label: "Uma letra maiúscula e uma minúscula" },
  { id: "number", label: "Um número" },
  { id: "special", label: "Um caractere especial" },
] as const;

export type PasswordRuleId = (typeof PASSWORD_RULES)[number]["id"];
export type PasswordScore = 0 | 1 | 2 | 3 | 4;
export type PasswordLevel = "empty" | "weak" | "medium" | "strong";

export type PasswordEvaluation = {
  rules: { id: PasswordRuleId; label: string; met: boolean }[];
  score: PasswordScore;
  level: PasswordLevel;
  levelLabel: "Fraca" | "Média" | "Forte" | "";
  isValid: boolean;
};

const checks: Record<PasswordRuleId, (password: string) => boolean> = {
  length: (p) => p.length >= 8,
  case: (p) => /\p{Lu}/u.test(p) && /\p{Ll}/u.test(p),
  number: (p) => /\d/.test(p),
  special: (p) => /[^\p{L}\p{N}\s]/u.test(p),
};

const levels: Record<PasswordLevel, PasswordEvaluation["levelLabel"]> = {
  empty: "",
  weak: "Fraca",
  medium: "Média",
  strong: "Forte",
};

/** Scores a password against `PASSWORD_RULES`. Pure. */
export function evaluatePassword(password: string): PasswordEvaluation {
  const rules = PASSWORD_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    met: checks[rule.id](password),
  }));
  const score = rules.filter((rule) => rule.met).length as PasswordScore;
  const level: PasswordLevel =
    password.length === 0 ? "empty" : score === 4 ? "strong" : score === 3 ? "medium" : "weak";
  return { rules, score, level, levelLabel: levels[level], isValid: score === 4 };
}

export function isStrongPassword(password: string): boolean {
  return evaluatePassword(password).isValid;
}
