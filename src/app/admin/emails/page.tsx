"use client";

import { useFormStatus } from "react-dom";
import { sendAdminEmail } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { toast } from "sonner";
import { Mail01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function EmailsPage() {
  async function handleSubmit(formData: FormData) {
    const result = await sendAdminEmail(null, formData);
    if (result?.success) {
      toast.success("Email sent successfully!");
      // Reset form optionally, but hard with server actions directly without JS ref
    } else {
      toast.error(result.message || "Failed to send email");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Emails</h2>
        <p className="text-muted-foreground">Send notifications to users.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Compose Email</CardTitle>
            <CardDescription>
              Send a transactional email via Resend.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="to">To</Label>
                <Input
                  id="to"
                  name="to"
                  type="email"
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="Important Update..."
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">Message (HTML supported)</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Hello user..."
                  className="min-h-[200px]"
                  required
                />
              </div>
              <div className="flex justify-end">
                <SubmitButton />
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={Mail01Icon} className="h-5 w-5" />
              Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p>
              • Use this form to send important announcements, password resets
              manually, or direct communications.
            </p>
            <p>
              • The email will be sent from the configured system address (e.g.,
              no-reply@gymratplus.com).
            </p>
            <p>
              • HTML content is supported in the message body for basic
              formatting.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
      Send Email
    </Button>
  );
}
