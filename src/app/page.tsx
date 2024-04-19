"use client";
import { Button } from "@/components/ui/button";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Home() {
  const organization = useOrganization();
  const user = useUser();
  let orgId: string | undefined = undefined;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }
  const files = useQuery(api.file.getFiles, orgId ? { orgId } : "skip")
  const createFile = useMutation(api.file.createFile)

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">

      <h1>DJRATAN</h1>

      <p>Tere ashiq tere diwane hai</p>


      <div>
        {files?.map((item) => {
          return <p key={item._id}>{item.name}</p>
        })}
      </div>
      <div>
        <Button onClick={() => {
          if (!orgId) return;
          createFile({

            name: "DJ RATAN",
            orgId,
          })
        }}>Mutation</Button>
      </div>
    </main>
  );
}

