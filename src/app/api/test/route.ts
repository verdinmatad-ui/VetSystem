// src/app/api/test/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getOwners } from "@/app/actions/owners";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search") ?? undefined;
  const owners = await getOwners(search);
  return NextResponse.json(owners);
}


