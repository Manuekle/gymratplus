"use client";

import { useSession } from "next-auth/react";

export default function UserProfile() {
  const { data: session } = useSession();

  if (!session?.user) {
    return <p>No has iniciado sesión</p>;
  }

  return (
    <div className="p-4 border rounded-lg shadow-md bg-card text-card-foreground">
      <h2 className="text-lg font-semibold">Perfil</h2>
      <p className="text-sm">Nombre: {session.user.name}</p>
      <p className="text-sm">Email: {session.user.email}</p>
      {session.user.image && (
        <img
          src={session.user.image}
          alt="Avatar"
          className="w-16 h-16 rounded-full mt-2"
        />
      )}
    </div>
  );
}
