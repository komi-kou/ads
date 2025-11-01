import { LoginForm } from "@/components/LoginForm";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <LoginForm />
    </main>
  );
}