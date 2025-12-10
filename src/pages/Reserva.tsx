import React from "react";

const Reserva: React.FC = () => {
  return (
    <div className="container py-12 min-h-[60vh]">
      <h1 className="text-4xl font-bold mb-6">Fazer Reserva</h1>
      <p className="text-lg text-muted-foreground">
        Esta página conterá o calendário de disponibilidade e o formulário de reserva.
      </p>
    </div>
  );
};

export default Reserva;