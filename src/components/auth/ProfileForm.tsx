import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Profile, ProfileUpdate, useUpdateProfile } from "@/integrations/supabase/profiles";
import { useAuth } from "@/context/AuthContext";
import { showSuccess, showError } from "@/utils/toast";

// 1. Definir o Schema de Validação
const profileSchema = z.object({
  full_name: z.string().min(2, {
    message: "O nome completo deve ter pelo menos 2 caracteres.",
  }).optional().or(z.literal("")),
  billing_address: z.string().optional().or(z.literal("")),
  whatsapp: z.string().optional().or(z.literal("")), // NOVO CAMPO
});

interface ProfileFormProps {
    profile: Profile;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ profile }) => {
    const { user } = useAuth();
    const { mutate: updateProfile, isPending } = useUpdateProfile();

    // 2. Inicializar o formulário com os dados atuais
    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            full_name: profile.full_name || "",
            billing_address: profile.billing_address || "",
            whatsapp: profile.whatsapp || "", // NOVO DEFAULT
        },
        mode: "onChange",
    });

    // 3. Função de Submissão
    async function onSubmit(values: z.infer<typeof profileSchema>) {
        if (!user) {
            showError("Usuário não autenticado.");
            return;
        }

        const updates: ProfileUpdate = {
            full_name: values.full_name || null,
            billing_address: values.billing_address || null,
            whatsapp: values.whatsapp || null, // NOVO CAMPO
        };

        updateProfile({ userId: user.id, updates }, {
            onSuccess: () => {
                showSuccess("Perfil atualizado com sucesso!");
            },
            onError: (error) => {
                showError(error.message);
            }
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-4">
                            <FormItem>
                                <FormLabel>Email (Não Editável)</FormLabel>
                                <Input value={user?.email || ""} disabled className="bg-muted/50" />
                            </FormItem>
                            
                            <FormField
                                control={form.control}
                                name="full_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome Completo</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Seu nome completo" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="whatsapp"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>WhatsApp (DDD + Número)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: 5511987654321" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="billing_address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Endereço de Cobrança</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Rua, número, cidade" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        
                        <Button type="submit" className="w-full" disabled={isPending || !form.formState.isDirty}>
                            {isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                "Salvar Alterações"
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export default ProfileForm;