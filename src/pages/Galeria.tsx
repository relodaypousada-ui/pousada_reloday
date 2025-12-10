import React from "react";

const Galeria: React.FC = () => {
  return (
    <div className="container py-12 min-h-[60vh]">
      <h1 className="text-4xl font-bold mb-6">Galeria de Fotos</h1>
      <p className="text-lg text-muted-foreground">
        Esta página exibirá a galeria de fotos e vídeos da pousada.
      </p>
    </div>
  );
};

export default Galeria;