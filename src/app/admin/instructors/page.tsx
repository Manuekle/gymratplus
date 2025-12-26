import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getPendingInstructors, verifyInstructor } from "../actions";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default async function AdminInstructorsPage() {
    const instructors = await getPendingInstructors();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Instructor Verification</h2>
                <p className="text-muted-foreground">Review and approve instructor applications.</p>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Requested</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {instructors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    No pending applications.
                                </TableCell>
                            </TableRow>
                        ) : (
                            instructors.map((profile) => (
                                <TableRow key={profile.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {/* We could add Avatar here if we had the component handy */}
                                            <span>{profile.user.name || "Unnamed User"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{profile.user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                            Pending
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(profile.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <VerifyButton id={profile.id} />
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

function VerifyButton({ id }: { id: string }) {
    return (
        <form
            action={async () => {
                "use server";
                await verifyInstructor(id);
            }}
        >
            <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4" />
                Approve
            </Button>
        </form>
    );
}
