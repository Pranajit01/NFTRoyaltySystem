"use client";

import { useState, useCallback } from "react";
import {
  mintNFT,
  getNFT,
  calculateRoyalty,
  CONTRACT_ADDRESS,
} from "@/hooks/contract";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Spotlight } from "@/components/ui/spotlight";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Icons ────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function NftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      <path d="M12 7v14" />
      <path d="M7 12h14" />
    </svg>
  );
}

function PercentIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" x2="5" y1="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  );
}

function DollarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

// ── Styled Input ─────────────────────────────────────────────

function Input({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-medium uppercase tracking-wider text-white/30">
        {label}
      </label>
      <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#7c6cf0]/30 focus-within:shadow-[0_0_20px_rgba(124,108,240,0.08)]">
        <input
          {...props}
          className="w-full rounded-[11px] bg-transparent px-4 py-3 font-mono text-sm text-white/90 placeholder:text-white/15 outline-none"
        />
      </div>
    </div>
  );
}

// ── Method Signature ─────────────────────────────────────────

function MethodSignature({
  name,
  params,
  returns,
  color,
}: {
  name: string;
  params: string;
  returns?: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 font-mono text-sm">
      <span style={{ color }} className="font-semibold">fn</span>
      <span className="text-white/70">{name}</span>
      <span className="text-white/20 text-xs">{params}</span>
      {returns && (
        <span className="ml-auto text-white/15 text-[10px]">{returns}</span>
      )}
    </div>
  );
}

// ── Tab Type ────────────────────────────────────────────────

type Tab = "mint" | "view" | "calculate";

interface ContractUIProps {
  walletAddress: string | null;
  onConnect: () => void;
  isConnecting: boolean;
}

export default function ContractUI({ walletAddress, onConnect, isConnecting }: ContractUIProps) {
  const [activeTab, setActiveTab] = useState<Tab>("mint");
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);

  // Mint state
  const [mintNftId, setMintNftId] = useState("");
  const [mintCreator, setMintCreator] = useState("");
  const [mintRoyalty, setMintRoyalty] = useState("");
  const [isMinting, setIsMinting] = useState(false);

  // View state
  const [viewNftId, setViewNftId] = useState("");
  const [isViewing, setIsViewing] = useState(false);
  const [nftData, setNftData] = useState<{ creator: string; royalty_percentage: number } | null>(null);

  // Calculate state
  const [calcNftId, setCalcNftId] = useState("");
  const [calcSalePrice, setCalcSalePrice] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [royaltyResult, setRoyaltyResult] = useState<bigint | null>(null);

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const handleMintNFT = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!mintNftId.trim() || !mintCreator.trim() || !mintRoyalty.trim()) {
      return setError("Fill in all fields");
    }
    const nftId = parseInt(mintNftId.trim());
    const royalty = parseInt(mintRoyalty.trim());
    if (isNaN(nftId) || isNaN(royalty)) return setError("Invalid number values");
    if (royalty > 100) return setError("Royalty cannot exceed 100%");

    setError(null);
    setIsMinting(true);
    setTxStatus("Awaiting signature...");
    try {
      await mintNFT(walletAddress, nftId, mintCreator.trim(), royalty);
      setTxStatus("NFT minted with royalty!");
      setMintNftId("");
      setMintCreator("");
      setMintRoyalty("");
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsMinting(false);
    }
  }, [walletAddress, mintNftId, mintCreator, mintRoyalty]);

  const handleGetNFT = useCallback(async () => {
    if (!viewNftId.trim()) return setError("Enter an NFT ID");
    const nftId = parseInt(viewNftId.trim());
    if (isNaN(nftId)) return setError("Invalid NFT ID");

    setError(null);
    setIsViewing(true);
    setNftData(null);
    try {
      const result = await getNFT(nftId, walletAddress || undefined);
      if (result && typeof result === "object") {
        setNftData(result as { creator: string; royalty_percentage: number });
      } else {
        setError("NFT not found");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setIsViewing(false);
    }
  }, [viewNftId, walletAddress]);

  const handleCalculateRoyalty = useCallback(async () => {
    if (!calcNftId.trim() || !calcSalePrice.trim()) return setError("Fill in all fields");
    const nftId = parseInt(calcNftId.trim());
    const salePrice = BigInt(calcSalePrice.trim());
    if (isNaN(nftId)) return setError("Invalid NFT ID");
    if (salePrice < BigInt(0)) return setError("Sale price must be positive");

    setError(null);
    setIsCalculating(true);
    setRoyaltyResult(null);
    try {
      const result = await calculateRoyalty(nftId, salePrice, walletAddress || undefined);
      if (result !== null) {
        setRoyaltyResult(result as bigint);
      } else {
        setError("Could not calculate royalty");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setIsCalculating(false);
    }
  }, [calcNftId, calcSalePrice, walletAddress]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "mint", label: "Mint", icon: <NftIcon />, color: "#7c6cf0" },
    { key: "view", label: "View", icon: <SearchIcon />, color: "#4fc3f7" },
    { key: "calculate", label: "Calculate", icon: <DollarIcon />, color: "#34d399" },
  ];

  return (
    <div className="w-full max-w-2xl animate-fade-in-up-delayed">
      {/* Toasts */}
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#f87171]/15 bg-[#f87171]/[0.05] px-4 py-3 backdrop-blur-sm animate-slide-down">
          <span className="mt-0.5 text-[#f87171]"><AlertIcon /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#f87171]/90">Error</p>
            <p className="text-xs text-[#f87171]/50 mt-0.5 break-all">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="shrink-0 text-[#f87171]/30 hover:text-[#f87171]/70 text-lg leading-none">&times;</button>
        </div>
      )}

      {txStatus && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#34d399]/15 bg-[#34d399]/[0.05] px-4 py-3 backdrop-blur-sm shadow-[0_0_30px_rgba(52,211,153,0.05)] animate-slide-down">
          <span className="text-[#34d399]">
            {txStatus.includes("on-chain") || txStatus.includes("minted") ? <CheckIcon /> : <SpinnerIcon />}
          </span>
          <span className="text-sm text-[#34d399]/90">{txStatus}</span>
        </div>
      )}

      {/* Main Card */}
      <Spotlight className="rounded-2xl">
        <AnimatedCard className="p-0" containerClassName="rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c6cf0]/20 to-[#4fc3f7]/20 border border-white/[0.06]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#7c6cf0]">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/90">NFT Royalty System</h3>
                <p className="text-[10px] text-white/25 font-mono mt-0.5">{truncate(CONTRACT_ADDRESS)}</p>
              </div>
            </div>
            <Badge variant="info" className="text-[10px]">Soroban</Badge>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/[0.06] px-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setActiveTab(t.key); setError(null); setNftData(null); setRoyaltyResult(null); }}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all",
                  activeTab === t.key ? "text-white/90" : "text-white/35 hover:text-white/55"
                )}
              >
                <span style={activeTab === t.key ? { color: t.color } : undefined}>{t.icon}</span>
                {t.label}
                {activeTab === t.key && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full transition-all"
                    style={{ background: `linear-gradient(to right, ${t.color}, ${t.color}66)` }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Mint */}
            {activeTab === "mint" && (
              <div className="space-y-5">
                <MethodSignature name="mint_nft" params="(nft_id: u32, creator: Address, royalty: u32)" color="#7c6cf0" />
                <Input label="NFT ID" type="number" value={mintNftId} onChange={(e) => setMintNftId(e.target.value)} placeholder="e.g. 1" />
                <Input label="Creator Address" value={mintCreator} onChange={(e) => setMintCreator(e.target.value)} placeholder="G..." />
                <Input label="Royalty Percentage" type="number" value={mintRoyalty} onChange={(e) => setMintRoyalty(e.target.value)} placeholder="e.g. 5 (max 100)" />
                
                {walletAddress ? (
                  <ShimmerButton onClick={handleMintNFT} disabled={isMinting} shimmerColor="#7c6cf0" className="w-full">
                    {isMinting ? <><SpinnerIcon /> Minting...</> : <><NftIcon /> Mint NFT</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#7c6cf0]/20 bg-[#7c6cf0]/[0.03] py-4 text-sm text-[#7c6cf0]/60 hover:border-[#7c6cf0]/30 hover:text-[#7c6cf0]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to mint NFTs
                  </button>
                )}
              </div>
            )}

            {/* View */}
            {activeTab === "view" && (
              <div className="space-y-5">
                <MethodSignature name="get_nft" params="(nft_id: u32)" returns="-> NFT" color="#4fc3f7" />
                <Input label="NFT ID" type="number" value={viewNftId} onChange={(e) => setViewNftId(e.target.value)} placeholder="e.g. 1" />
                <ShimmerButton onClick={handleGetNFT} disabled={isViewing} shimmerColor="#4fc3f7" className="w-full">
                  {isViewing ? <><SpinnerIcon /> Fetching...</> : <><SearchIcon /> Get NFT Details</>}
                </ShimmerButton>

                {nftData && (
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden animate-fade-in-up">
                    <div className="border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-white/25">NFT Details</span>
                      <Badge variant="success">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#34d399]" />
                        Found
                      </Badge>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/35">NFT ID</span>
                        <span className="font-mono text-sm text-white/80">{viewNftId}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/35">Creator</span>
                        <span className="font-mono text-sm text-white/80">{truncate(nftData.creator)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/35">Royalty</span>
                        <span className="font-mono text-sm text-white/80">{nftData.royalty_percentage}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Calculate */}
            {activeTab === "calculate" && (
              <div className="space-y-5">
                <MethodSignature name="calculate_royalty" params="(nft_id: u32, sale_price: i128)" returns="-> i128" color="#34d399" />
                <Input label="NFT ID" type="number" value={calcNftId} onChange={(e) => setCalcNftId(e.target.value)} placeholder="e.g. 1" />
                <Input label="Sale Price (stroops)" value={calcSalePrice} onChange={(e) => setCalcSalePrice(e.target.value)} placeholder="e.g. 1000000000 (10 XLM)" />
                <ShimmerButton onClick={handleCalculateRoyalty} disabled={isCalculating} shimmerColor="#34d399" className="w-full">
                  {isCalculating ? <><SpinnerIcon /> Calculating...</> : <><PercentIcon /> Calculate Royalty</>}
                </ShimmerButton>

                {royaltyResult !== null && (
                  <div className="rounded-xl border border-[#34d399]/20 bg-[#34d399]/[0.05] overflow-hidden animate-fade-in-up">
                    <div className="border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-white/25">Royalty Amount</span>
                      <Badge variant="success">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#34d399]" />
                        Calculated
                      </Badge>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/35">Sale Price</span>
                        <span className="font-mono text-sm text-white/80">{calcSalePrice} stroops</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/35">Royalty</span>
                        <span className="font-mono text-sm text-[#34d399]">{royaltyResult.toString()} stroops</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                        <span className="text-xs text-white/35">≈</span>
                        <span className="font-mono text-sm text-white/60">{Number(royaltyResult) / 10000000} XLM</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.04] px-6 py-3 flex items-center justify-between">
            <p className="text-[10px] text-white/15">NFT Royalty System &middot; Soroban</p>
            <div className="flex items-center gap-2">
              {["Mint", "View", "Calculate"].map((s, i) => (
                <span key={s} className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-white/20" />
                  <span className="font-mono text-[9px] text-white/15">{s}</span>
                  {i < 2 && <span className="text-white/10 text-[8px]">&rarr;</span>}
                </span>
              ))}
            </div>
          </div>
        </AnimatedCard>
      </Spotlight>
    </div>
  );
}
