"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  const [inputValue, setInputValue] = useState("");

  return (
    <main>
      <div>
        <h1>Üdv a kezdőlapon!</h1>
        <Link href="/register">
          <Button>Register</Button>
        </Link>
      </div>
    </main>
  );
}
