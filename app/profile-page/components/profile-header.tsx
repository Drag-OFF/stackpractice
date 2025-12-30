import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Mail } from "lucide-react";

type Props = {
  user?: {
    name?: string | null;
    username?: string | null;
    email?: string | null;
    created?: Date | string | null;
  } | null;
};

export default function ProfileHeader({ user }: Props) {
  const displayName = user?.name ?? user?.username ?? "John Doe";
  const email = user?.email ?? "john.doe@example.com";
  const joined = user?.created ? new Date(user.created).toLocaleDateString() : "Joined March 2023";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <div>
      <br />
      <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src="https://bundui-images.netlify.app/avatars/08.png" alt="Profile" />
              <AvatarFallback className="text-2xl">JD</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <h1 className="text-2xl font-bold">{displayName}</h1>
            </div>
            <div className="h-10text-neutral-500 flex flex-wrap gap-4 text-sm dark:text-neutral-400">
              <div className="flex items-center gap-1">
                <Mail className="size-4" />
                {email}
              </div>

              <div className="flex items-center gap-1">
                <Calendar className="size-4" />
                {joined}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}
