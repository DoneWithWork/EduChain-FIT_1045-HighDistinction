"use client";
import { MintCertAction } from "@/app/actions/mintCert";
import { Button } from "@/components/ui/button";
import { useZkCredentials } from "@/hooks/useEphemeralSession";
import { suiClient } from "@/lib/sui";
import { PublicZkLoginService } from "@/lib/zkLogin";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

const defaultState: { success: boolean; error?: string } = {
  success: false,
};
const publicZkClient = new PublicZkLoginService(suiClient);

type MintCertProps = {
  email: string;
  studentName: string;
  certId: number;
  issuerName: string;
  imageUrl: string;
};

export default function MintButton({
  email,
  studentName,
  certId,
  issuerName,
  imageUrl,
}: MintCertProps) {
  const [, startTransition] = useTransition();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [state, dispatch] = useActionState(MintCertAction, defaultState);
  const { zkCredentials } = useZkCredentials();
  const handleMint = async () => {
    try {
      setLoading(true);
      if (!zkCredentials.address) {
        throw new Error("ZkLogin address is not available.");
      }

      const fakeTrx = {
        studentEmail: email,
        studentAddress: zkCredentials.address!,
        fullName: studentName,
        issuerName,
        courseImageUrl: imageUrl,
        createdAt: new Date().toISOString(),
      };

      const bytes = await publicZkClient.newCertificateMintTransaction(fakeTrx);
      console.log("Mint transaction bytes:", bytes);

      // Sponsor the transaction with gas paid by our service rather than the user
      const { sponsoredBytes, sponsorSignature } =
        await publicZkClient.newSponsoredTransaction(
          zkCredentials.address!,
          bytes
        );
      // Decode base64 to Uint8Array
      const decodedBytes = Uint8Array.from(atob(sponsoredBytes), (c) =>
        c.charCodeAt(0)
      );

      // Create transaction from the unsigned bytes
      const sponsoredTransaction = Transaction.from(decodedBytes);
      console.log(sponsoredTransaction.getData());

      const userSignedTx = await sponsoredTransaction.sign({
        client: suiClient,
        signer: Ed25519Keypair.fromSecretKey(zkCredentials.privateKey!),
      });
      // const addressSeed = genAddressSeed(
      //   BigInt(zkCredentials.salt!),
      //   "sub",
      //   zkCredentials.sub!,
      //   zkCredentials.aud!
      // ).toString();

      // const zkLoginSignature = getZkLoginSignature({
      //   inputs: {
      //     ...zkCredentials.partialZkLoginSignature!,
      //     addressSeed,
      //   },
      //   maxEpoch: zkCredentials.epoch!,
      //   userSignature: userSignedTx.signature,
      // });

      const result = await suiClient.executeTransactionBlock({
        transactionBlock: userSignedTx.bytes,
        signature: [sponsorSignature],
        options: {
          showEffects: true,
          showEvents: true,
          showObjectChanges: true,
        },
      });
      const txResult = await suiClient.waitForTransaction({
        digest: result.digest,
        options: { showEffects: true, showEvents: true },
      });
      if (txResult.effects?.status.status !== "success")
        throw new Error(txResult.effects?.status.error || "Transaction failed");
      const created = txResult.effects?.created?.find(
        (obj) =>
          typeof obj.owner === "object" &&
          "AddressOwner" in obj.owner &&
          obj.owner.AddressOwner === zkCredentials.address!
      );
      const objectId = created?.reference?.objectId;
      if (!objectId) throw new Error("Failed to retrieve minted object ID");
      console.log("Object ID:", objectId);
      console.log("Mint transaction result:", result.digest);
      startTransition(async () => {
        await dispatch({ digest: result.digest, certId, objectId });
      });
    } catch (err) {
      console.error("Minting failed:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (state.success) {
      toast.success("Certificate minted successfully!");
      router.refresh();
    } else if (state.error) {
      toast.error(`Minting failed: ${state.error}`);
    }
  }, [state, router]);
  return (
    <Button
      className="w-full cursor-pointer"
      disabled={loading}
      onClick={handleMint}
    >
      {loading ? (
        <div className="flex flex-row items-center gap-3">
          <Loader2 className="animate-spin size-5" />
          <span>Minting...</span>
        </div>
      ) : (
        "Mint Certificate"
      )}
    </Button>
  );
}
