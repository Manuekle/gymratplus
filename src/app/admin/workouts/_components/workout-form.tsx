"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFormState } from "react-dom";
import { createAdminWorkout } from "@/app/admin/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";

export function WorkoutForm() {
    const [state, action] = useFormState(createAdminWorkout, null);

    return (
        <form action={action} className="space-y-6 max-w-2xl">
            {state?.message && (
                <Alert variant={state.errors ? "destructive" : "default"}>
                    <AlertCircleIcon className="h-4 w-4" />
                    <AlertDescription>{state.message}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-2">
                <Label htmlFor="name">Workout Name</Label>
                <Input id="name" name="name" placeholder="e.g. Beginner Full Body A" required />
                {state?.errors?.name && <p className="text-sm text-destructive">{state.errors.name}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="Describe the focus of this workout..." />
                {state?.errors?.description && <p className="text-sm text-destructive">{state.errors.description}</p>}
            </div>

            {/* 
                For MVP of Admin Expansion, we are just creating the Shell (Workout entity).
                Managing Exercises within a workout is a complex UI (drag and drop, search exercises) 
                which might be out of scope for this quick expansion unless requested.
                The user asked "what else can be added", implying high level features.
                We'll start with creating the header/template container. 
            */}

            <div className="flex justify-end gap-4">
                <Button type="submit">Create Template</Button>
            </div>
        </form>
    );
}
