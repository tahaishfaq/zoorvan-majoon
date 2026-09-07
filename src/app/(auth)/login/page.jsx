import AuthForm from "@/components/forms/auth-form";
export const metadata = { title: "Sign in" };
export default function Page() {
  return (
    <div className="container section">
      <AuthForm />
    </div>
  );
}
