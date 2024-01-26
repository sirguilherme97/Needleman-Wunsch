'use client'
import React, { useEffect, useState } from "react";

export default function NeedlemanWunschComponent({ seq1, seq2, gapPenalty, mismatchPenalty }:any) {
    const [alignedSeq1, setAlignedSeq1] = useState<string[]>([]);
    const [alignedSeq2, setAlignedSeq2] = useState<string[]>([]);

    useEffect(() => {
        function needlemanWunsch(seq1:string, seq2:string, gapPenalty:number, mismatchPenalty:number) {
            const m = seq1.length;
            const n = seq2.length;

            // Inicialização da matriz de pontuações
            const scoreMatrix = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

            // Inicialização da matriz de traceback para manter informações sobre a origem dos valores
            const tracebackMatrix = Array.from({ length: m + 1 }, () => Array(n + 1).fill(" "));

            // Inicialização da matriz de pontuações com penalidades de lacuna
            for (let i = 1; i <= m; ++i) {
                scoreMatrix[i][0] = scoreMatrix[i - 1][0] + gapPenalty;
                tracebackMatrix[i][0] = "U"; // U representa que o valor veio de cima (up)
            }

            for (let j = 1; j <= n; ++j) {
                scoreMatrix[0][j] = scoreMatrix[0][j - 1] + gapPenalty;
                tracebackMatrix[0][j] = "L"; // L representa que o valor veio da esquerda (left)
            }

            // Preenchimento da matriz de pontuações e matriz de traceback
            for (let i = 1; i <= m; ++i) {
                for (let j = 1; j <= n; ++j) {
                    const match = scoreMatrix[i - 1][j - 1] + (seq1[i - 1] === seq2[j - 1] ? 1 : mismatchPenalty);
                    const gapUp = scoreMatrix[i - 1][j] + gapPenalty;
                    const gapLeft = scoreMatrix[i][j - 1] + gapPenalty;

                    // Escolha do máximo entre as três opções
                    scoreMatrix[i][j] = Math.max(match, gapUp, gapLeft);

                    // Determinação da origem do valor máximo
                    if (scoreMatrix[i][j] === match) {
                        tracebackMatrix[i][j] = "D"; // D representa que o valor veio diagonalmente (diagonal)
                    } else if (scoreMatrix[i][j] === gapUp) {
                        tracebackMatrix[i][j] = "U";
                    } else {
                        tracebackMatrix[i][j] = "L";
                    }
                }
            }

            // Traceback para obter o alinhamento
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

            return [alignedSeq1, alignedSeq2];
        }

        const [alignedSeq1, alignedSeq2] = needlemanWunsch(seq1, seq2, gapPenalty, mismatchPenalty);
        setAlignedSeq1(alignedSeq1);
        setAlignedSeq2(alignedSeq2);
    }, [seq1, seq2, gapPenalty, mismatchPenalty]);

    return (
        <div className="w-screen px-10 h-auto items-start justify-start flex flex-col gap-2">
            <div className="flex flex-row flex-wrap max-w-full">
                {alignedSeq1.map((char, index) => (
                    <div key={index} className={`p-2 font-monospace w-8 ${char === "-" ? "bg-red-500" : (char === alignedSeq2[index] ? "bg-green-500" : "bg-yellow-500")}`}>{char}</div>
                ))}
            </div>
            <div className="flex flex-row flex-wrap max-w-full">
                {alignedSeq2.map((char, index) => (
                    <div key={index} className={`p-2 font-monospace w-8 ${char === "-" ? "bg-red-500" : (char === alignedSeq1[index] ? "bg-green-500" : "bg-yellow-500")}`}>{char}</div>
                ))}
            </div>
        </div>
    );
    
}
