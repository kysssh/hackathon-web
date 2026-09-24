import { redirect } from "next/navigation";

export default function Home() {
  // Redirige automáticamente a la pantalla de inicio de sesión
  redirect("/ingresar");
}