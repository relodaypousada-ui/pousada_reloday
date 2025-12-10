import React from "react";
import { Badge } from "@/components/ui/badge";
import { ReservaStatus } from "@/integrations/supabase/reservas";
import { Clock, CheckCircle, XCircle, History } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReservaStatusBadgeProps {
  status: ReservaStatus;
}

const statusMap = {
  pendente: {
    label: "Pendente",
    icon: Clock,
    className: "bg-yellow-500 hover:bg-yellow-600 text-white",
  },
  confirmada: {
    label: "Confirmada",
    icon: CheckCircle,
    className: "bg-green-500 hover:bg-green-600 text-white",
  },
  cancelada: {
    label: "Cancelada",
    icon: XCircle,
    className: "bg-red-500 hover:bg-red-600 text-white",
  },
  concluida: {
    label: "Concluída",
    icon: History,
    className: "bg-gray-500 hover:bg-gray-600 text-white",
  },
};

const ReservaStatusBadge: React.FC<ReservaStatusBadgeProps> = ({ status }) => {
  const { label, icon: Icon, className } = statusMap[status] || statusMap.pendente;

  return (
    <Badge className={cn("capitalize", className)}>
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  );
};

export default ReservaStatusBadge;