import { redirect } from "next/navigation";

/**
 * /home now redirects to the combined home+accounts page.
 * The login flow still lands on /home — this just forwards it along.
 */
export default function HomePage() {
  redirect("/accounts");
}
