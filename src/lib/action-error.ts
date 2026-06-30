const ENUM_ROLE_HINT =
  "This role is not in the database yet. In Supabase SQL Editor, run 004_step1_enum.sql first, then 004_step2_functions.sql.";

export function formatActionError(error: unknown): string {
  if (typeof error === "string") {
    if (!error || error === "{}") return ENUM_ROLE_HINT;
    if (error.includes("enum user_role")) return ENUM_ROLE_HINT;
    return error;
  }

  if (error instanceof Error) {
    if (!error.message || error.message === "{}") return ENUM_ROLE_HINT;
    if (error.message.includes("enum user_role")) return ENUM_ROLE_HINT;
    return error.message;
  }

  if (error && typeof error === "object" && "message" in error) {
    return formatActionError(String((error as { message: unknown }).message));
  }

  return "Something went wrong. Please try again.";
}

export function isRoleEnumError(message: string): boolean {
  return message.includes("enum user_role") || message.includes("invalid input value for enum");
}
