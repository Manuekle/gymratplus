import UserProfile from "@/components/user-profile";
import { Navbar } from "@/components/navbar";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <UserProfile />
        </div>
      </main>
    </div>
  );
}
