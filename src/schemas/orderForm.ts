import z from "zod";

export const orderFormSchema = z.object({
    waiterId: z.string().min(1, "Selecione um garçom"),
    items: z.array(z.object({
        itemId: z.string().min(1, "Selecione um item"),
        additions: z.array(z.string()),
        observations: z.string()
    }))
});

export type OrderForm = z.infer<typeof orderFormSchema>;
