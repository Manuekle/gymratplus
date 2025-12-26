"use client";

import { useFormStatus } from "react-dom";
import { createFood, updateFood } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface FoodFormProps {
    food?: {
        id: string;
        name: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        serving: number;
        category: string;
    };
}

export function FoodForm({ food }: FoodFormProps) {
    const isEditing = !!food;
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        if (isEditing && food) {
            const result = await updateFood(food.id, null, formData);
            if (result?.errors) {
                toast.error("Please check the form for errors.");
            } else if (result?.message) {
                if (result.message.includes("Failed")) {
                    toast.error(result.message);
                } else {
                    toast.success("Food Updated");
                }
            } else {
                toast.success("Food Updated");
            }
        } else {
            const result = await createFood(null, formData);
            if (result?.errors) {
                toast.error("Please check the form for errors.");
            } else if (result?.message) {
                if (result.message.includes("Failed")) {
                    toast.error(result.message);
                } else {
                    toast.success("Food Created");
                }
            } else {
                toast.success("Food Created");
            }
        }
    }

    return (
        <Card>
            <CardContent className="pt-6">
                <form action={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="e.g. Chicken Breast"
                                defaultValue={food?.name}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="category">Category</Label>
                            <Select name="category" defaultValue={food?.category || "protein"}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="protein">Protein</SelectItem>
                                    <SelectItem value="carbs">Carbs</SelectItem>
                                    <SelectItem value="fats">Fats</SelectItem>
                                    <SelectItem value="vegetables">Vegetables</SelectItem>
                                    <SelectItem value="drinks">Drinks</SelectItem>
                                    <SelectItem value="snacks">Snacks</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="calories">Calories</Label>
                            <Input
                                id="calories"
                                name="calories"
                                type="number"
                                placeholder="0"
                                defaultValue={food?.calories}
                                required
                                min="0"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="protein">Protein (g)</Label>
                            <Input
                                id="protein"
                                name="protein"
                                type="number"
                                placeholder="0"
                                defaultValue={food?.protein}
                                required
                                min="0"
                                step="0.1"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="carbs">Carbs (g)</Label>
                            <Input
                                id="carbs"
                                name="carbs"
                                type="number"
                                placeholder="0"
                                defaultValue={food?.carbs}
                                required
                                min="0"
                                step="0.1"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="fat">Fat (g)</Label>
                            <Input
                                id="fat"
                                name="fat"
                                type="number"
                                placeholder="0"
                                defaultValue={food?.fat}
                                required
                                min="0"
                                step="0.1"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="serving">Serving (g/ml)</Label>
                            <Input
                                id="serving"
                                name="serving"
                                type="number"
                                placeholder="100"
                                defaultValue={food?.serving}
                                required
                                min="0"
                                step="1"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>
                        <SubmitButton isEditing={isEditing} />
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" disabled={pending}>
            {pending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Update Food" : "Create Food"}
        </Button>
    );
}
