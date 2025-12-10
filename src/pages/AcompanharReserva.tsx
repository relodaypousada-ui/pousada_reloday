import React from "react";

const AcompanharReserva: React.FC = () => {
  return (
    <div className="container py-12 min-h-[60vh]">
      <h1 className="text-4xl font-bold mb-6">Acompanhar Reserva</h1>
      <p className="text-lg text-muted-foreground">
        Esta página permitirá ao usuário logado visualizar e gerenciar suas reservas.
      </p>
    </div>
  );
};

export default AcompanharReserva;