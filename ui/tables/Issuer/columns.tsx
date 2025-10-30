"use client";

import { Certificate } from "@/db/schema";
import { ColumnDef, Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";

import { RevokeCert } from "@/app/actions/revokeCert";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useActionState, useEffect, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
type CertColumnsProps = Pick<
  Certificate,
  "id" | "studentEmail" | "certAddress" | "revoked"
>;
export const CertColumns: ColumnDef<CertColumnsProps>[] = [
  {
    accessorKey: "studentEmail",
    header: "Email",
  },
  {
    accessorKey: "certAddress",
    header: "Mint Address",
    cell: ({ row }) => {
      return row.original.certAddress ? (
        <Link
          href={`https://suiscan.xyz/testnet/tx/${row.original.certAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          View ↗
        </Link>
      ) : (
        "Not minted"
      );
    },
  },
  {
    accessorKey: "revoked",
    header: "Status",
    cell: ({ row }) => {
      return row.original.revoked == 1 ? "Revoked" : "Active";
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return <RevokeAction row={row} />;
    },
  },
];
function RevokeAction({ row }: { row: Row<CertColumnsProps> }) {
  const [state, dispatch, pending] = useActionState(RevokeCert, {
    success: false,
    error: "",
  });
  const [isPending, startTransition] = useTransition();
  const cert = row.original;
  async function revoke() {
    startTransition(() => {
      dispatch(cert.id);
    });
  }
  const router = useRouter();
  useEffect(() => {
    if (state.success) {
      toast.success("Certificate revoked successfully");
      router.refresh();
      console.log("Certificate revoked successfully");
    }
    if (state.error) {
      console.error("Error revoking certificate:", state.error);
      toast.error(state.error);
    }
  }, [state, router]);
  return (
    <div>
      {cert.certAddress && cert.certAddress.length > 0 ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(cert.id.toString())}
            >
              <Button
                variant="destructive"
                size="sm"
                onClick={revoke}
                disabled={cert.revoked == 1 || isPending || pending}
                className="w-full"
              >
                {isPending || pending
                  ? "Revoking..."
                  : cert.revoked == 1
                  ? "Revoked"
                  : "Revoke"}
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <span className="text-muted-foreground">No actions available</span>
      )}
    </div>
  );
}
