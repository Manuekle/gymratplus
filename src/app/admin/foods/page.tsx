import { getFoods, deleteFood } from "../actions";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusSignIcon, Edit02Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default async function FoodsPage({
    searchParams,
}: {
    searchParams: { query?: string };
}) {
    const query = searchParams?.query || "";
    const foods = await getFoods(query);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Foods</h2>
                    <p className="text-muted-foreground">Manage nutritional database.</p>
                </div>
                <Link href="/admin/foods/new">
                    <Button className="gap-2">
                        <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4" />
                        Add New
                    </Button>
                </Link>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Calories</TableHead>
                            <TableHead>Macros (P/C/F)</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {foods.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    No foods found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            foods.map((food) => (
                                <TableRow key={food.id}>
                                    <TableCell className="font-medium">{food.name}</TableCell>
                                    <TableCell className="capitalize">{food.category}</TableCell>
                                    <TableCell>{food.calories}</TableCell>
                                    <TableCell>
                                        {food.protein}g / {food.carbs}g / {food.fat}g
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/admin/foods/${food.id}`}>
                                                <Button variant="ghost" size="icon">
                                                    <HugeiconsIcon icon={Edit02Icon} className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <DeleteButton id={food.id} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

function DeleteButton({ id }: { id: string }) {
    return (
        <form
            action={async () => {
                "use server";
                await deleteFood(id);
            }}
        >
            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90">
                <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
            </Button>
        </form>
    );
}
