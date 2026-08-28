import { NextResponse } from "next/server";
import { requireRole } from "../../../../../src/auth/session";
import { getProofAttachment } from "../../../../../src/db/repository.submissions";

type Props = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Props) {
  const session = await requireRole("USER");
  const { id } = await params;
  const record = await getProofAttachment(id);
  if (!record || (record.submitterUserId !== session.user.id && !["REVIEWER", "EDITOR", "ADMIN", "SUPERADMIN"].includes((session.user.role ?? "")))) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(new Uint8Array(record.attachment.contents), { headers: { "content-type": record.attachment.mimeType, "content-disposition": `inline; filename="${record.attachment.filename.replace(/["\\]/g, "_")}"`, "cache-control": "private, no-store" } });
}
