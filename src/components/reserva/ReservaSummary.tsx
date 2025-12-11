import React from "react";
import { Card } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

interface ReservaSummaryProps {
    selectedAcomodacaoTitle: string | undefined;
    numNights: number;
    precoPorNoite: number;
    valorTotal: number;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const ReservaSummary: React.FC<ReservaSummaryProps> = ({
    selectedAcomodacaoTitle,
    numNights,
    precoPorNoite,
    valorTotal,
}) => {
    return (
        <Card className="bg-accent/50 p-4 space-y-2">
            <h3 className="text-lg font-semibold">Resumo da Reserva</h3>
            <div className="flex justify-between text-sm">
                <span>Acomodação:</span>
                <span className="font-medium">{selectedAcomodacaoTitle || "Selecione acima"}</span>
            </div>
            <div className="flex justify-between text-sm">
                <span>Noites:</span>
                <span className="font-medium">{numNights}</span>
            </div>
            <div className="flex justify-between text-sm">
                <span>Preço por Noite:</span>
                <span className="font-medium">{formatCurrency(precoPorNoite)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-accent-foreground/20">
                <span className="text-xl font-bold flex items-center"><DollarSign className="h-5 w-5 mr-1" /> Valor Total:</span>
                <span className="text-xl font-bold text-primary">{formatCurrency(valorTotal)}</span>
            </div>
        </Card>
    );
};

export default ReservaSummary;