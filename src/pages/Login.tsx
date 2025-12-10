import React from "react";

const Login: React.FC = () => {
  return (
    <div className="container py-12 min-h-[60vh]">
      <h1 className="text-4xl font-bold mb-6">Login</h1>
      <p className="text-lg text-muted-foreground">
        Esta página será usada para autenticação de usuários (login/recuperar senha).
      </p>
    </div>
  );
};

export default Login;