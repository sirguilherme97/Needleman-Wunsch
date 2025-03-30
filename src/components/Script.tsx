'use client'
import React, { useEffect, useState } from "react";

export default function NeedlemanWunschComponent({ seq1, seq2, matchScore, gapPenalty, mismatchPenalty }: any) {
    const [alignedSeq1, setAlignedSeq1] = useState<string[]>([]);
    const [alignedSeq2, setAlignedSeq2] = useState<string[]>([]);
    const [alignmentScore, setAlignmentScore] = useState<number>(0);

    useEffect(() => {
        function needlemanWunsch(seq1: string, seq2: string, matchScore: number, gapPenalty: number, mismatchPenalty: number) {
            const m = seq1.length;
            const n = seq2.length;

            const scoreMatrix = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
            const tracebackMatrix = Array.from({ length: m + 1 }, () => Array(n + 1).fill(" "));

            for (let i = 1; i <= m; ++i) {
                scoreMatrix[i][0] = scoreMatrix[i - 1][0] + gapPenalty;
                tracebackMatrix[i][0] = "U";
            }
            for (let j = 1; j <= n; ++j) {
                scoreMatrix[0][j] = scoreMatrix[0][j - 1] + gapPenalty;
                tracebackMatrix[0][j] = "L";
            }

            for (let i = 1; i <= m; ++i) {
                for (let j = 1; j <= n; ++j) {
                    const match = scoreMatrix[i - 1][j - 1] + (seq1[i - 1] === seq2[j - 1] ? matchScore : mismatchPenalty);
                    const gapUp = scoreMatrix[i - 1][j] + gapPenalty;
                    const gapLeft = scoreMatrix[i][j - 1] + gapPenalty;

                    scoreMatrix[i][j] = Math.max(match, gapUp, gapLeft);

                    if (scoreMatrix[i][j] === match) {
                        tracebackMatrix[i][j] = "D";
                    } else if (scoreMatrix[i][j] === gapUp) {
                        tracebackMatrix[i][j] = "U";
                    } else {
                        tracebackMatrix[i][j] = "L";
                    }
                }
            }

            let i = m, j = n;
            const alignedSeq1: string[] = [];
            const alignedSeq2: string[] = [];

            while (i > 0 || j > 0) {
                if (tracebackMatrix[i][j] === "D") {
                    alignedSeq1.unshift(seq1[i - 1]);
                    alignedSeq2.unshift(seq2[j - 1]);
                    --i;
                    --j;
                } else if (tracebackMatrix[i][j] === "U") {
                    alignedSeq1.unshift(seq1[i - 1]);
                    alignedSeq2.unshift("-");
                    --i;
                } else {
                    alignedSeq1.unshift("-");
                    alignedSeq2.unshift(seq2[j - 1]);
                    --j;
                }
            }

            return { alignedSeq1, alignedSeq2, finalScore: scoreMatrix[m][n] };
        }

        if (seq1 && seq2) {
            const { alignedSeq1, alignedSeq2, finalScore } = needlemanWunsch(seq1, seq2, matchScore, gapPenalty, mismatchPenalty);
            setAlignedSeq1(alignedSeq1);
            setAlignedSeq2(alignedSeq2);
            setAlignmentScore(finalScore);
        } else {
            setAlignedSeq1([]);
            setAlignedSeq2([]);
            setAlignmentScore(0);
        }
    }, [seq1, seq2, matchScore, gapPenalty, mismatchPenalty]);

    return (
        <div className="w-screen px-10 h-auto flex flex-col gap-5">
            {seq1 != "" && seq2 != "" && matchScore != 0 && (
                <div className="text-white font-bold text-center pb-5">
                    Alignment Score: <span className="text-green-400">{matchScore == 0 ? alignmentScore : alignmentScore}</span>
                </div>
            )}
            <div className="flex flex-row flex-wrap max-w-full">

                {alignedSeq1.map((char, index) => (
                    <div
                        key={index}
                        className={`p-2 font-mono w-8 text-center ${char === "-" ? "bg-red-500" : char === alignedSeq2[index] ? "bg-green-500" : "bg-yellow-500"}`}
                    >
                        {char}
                    </div>
                ))}
            </div>
            <div className="flex flex-row flex-wrap max-w-full">
                {alignedSeq2.map((char, index) => (
                    <div
                        key={index}
                        className={`p-2 font-mono w-8 text-center ${char === "-" ? "bg-red-500" : char === alignedSeq1[index] ? "bg-green-500" : "bg-yellow-500"}`}
                    >
                        {char}
                    </div>
                ))}
            </div>

        </div>
    );
}