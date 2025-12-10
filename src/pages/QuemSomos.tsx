import React from "react";

const QuemSomos: React.FC = () => {
  return (
    <div className="container py-12 min-h-[60vh]">
      <h1 className="text-4xl font-bold mb-6">Quem Somos</h1>
      <p className="text-lg text-muted-foreground">
        Esta é a página Quem Somos. O conteúdo será gerenciado dinamicamente pelo painel administrativo.
      </p>
    </div>
  );
};

export default QuemSomos;