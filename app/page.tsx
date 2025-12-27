"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function Home() {
  const [inputValue, setInputValue] = useState("");

  return (
    <main className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Üdv a kezdőlapon!</h1>

        <Input
          placeholder="Írj valamit..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />

        <Dialog>
          <DialogTrigger asChild>
            <Button>Megnyitás</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Beírt szöveg</DialogTitle>
              <DialogDescription>
                Ezt írtad be: <strong>{inputValue || "Semmit :)"}</strong>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
