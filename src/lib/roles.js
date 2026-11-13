// where each role lands after login
export const homeFor = (role) =>
  role === "staff" ? "/sales/new" : "/dashboard";
