import ProfileHeader from "./components/profile-header";
import ProfileContent from "./components/profile-content";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Page() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-10">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <ProfileHeader />
      <ProfileContent />
    </div>
  );
}
