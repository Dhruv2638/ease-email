"use client";

import React from "react";
import { Button } from "./ui/button";
import { getAuriknoAuthUrl } from "@/lib/aurinko";

const LinkAccountButton = () => {
  return (
    <Button
      onClick={async () => {
        const authUrl = await getAuriknoAuthUrl("Google");
        window.location.href = authUrl;
      }}
    >
      Link Account
    </Button>
  );
};

export default LinkAccountButton;
