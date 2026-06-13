import { Button } from "@/components/ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";

// TODO implement edit user form
export function EditUser({ userId }: { userId: string }) {
  return (
    <ResponsiveDialog>
      <ResponsiveDialogTrigger asChild>
        <Button variant="outline" size="sm">
          Gérer
        </Button>
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Gérer l&apos;utilisateur</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Gérer les informations de l&apos;utilisateur {userId}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
